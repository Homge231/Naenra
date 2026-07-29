import { Room, Client } from "colyseus";
import { MatchState, Player } from "./schema/MatchState";
import { verifyToken } from "../utils/jwt";
import { supabase } from "../config/supabase";
import crypto from 'crypto';
import { generateOracleHints, normalizeAnswer } from "../controllers/gameController";
import { addActiveClient, removeActiveClient } from "../utils/activeClients";

export class MatchRoom extends Room<{ state: MatchState }> {
  maxClients = 2;
  private isCustomRoom: boolean = false;
  private raceQuestions: any[] = [];
  private currentRaceQuestionIndex: number = 0;
  private raceQuestionTimer: ReturnType<typeof setTimeout> | null = null;
  private raceLockedPlayers: Set<string> = new Set();

  onCreate(options: any) {
    this.setState(new MatchState());
    this.isCustomRoom = options.isCustom === true;
    this.state.isCustom = this.isCustomRoom;


    this.onMessage("updateMetadata", (client, message) => {
      console.log(`Update metadata from ${client.sessionId}:`, message);
      if (message.vocabularyLevel) this.state.metadata.vocabularyLevel = message.vocabularyLevel;
      if (message.difficulty) this.state.metadata.difficulty = message.difficulty;
      if (message.topic) this.state.metadata.topic = message.topic;
    });

    this.onMessage("start_match", (client) => {
      console.log(`Received start_match from ${client.sessionId}`);
      if (this.state.players.size === 2) {
        this.state.status = "starting";
        this.broadcast("match_started");
      }
    });

    this.onMessage("return_to_lobby", (client) => {
      console.log(`Received return_to_lobby from ${client.sessionId}`);
      this.state.status = "waiting";
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.isReady = false;
        player.score = 0;
      }
    });

    this.onMessage("cancel_queue", (client) => {
      console.log(`Received cancel_queue from ${client.sessionId}`);
      client.leave();
    });

    this.onMessage("update_score", (client, message: { score: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.score = message.score;
        console.log(`Updated player ${player.name} score to ${player.score}`);
      } else {
        console.warn(`[MatchRoom] player not found for sessionId: ${client.sessionId}`);
      }
    });

    this.onMessage("update_core", (client, message: { coreId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.activeCoreId = message.coreId;
        console.log(`Updated player ${player.name} activeCoreId to ${player.activeCoreId}`);
      }
    });

    this.onMessage("player_milestone", (client, message: { type: string, message: string, icon: string, color: string }) => {
      this.broadcast("opponent_milestone", message, { except: client });
    });

    this.onMessage("player_skip", (client) => {
      this.broadcast("opponent_skip", {}, { except: client });
    });

    this.onMessage("finished_round", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.isFinished = true;
      }
      const players = Array.from(this.state.players.values());
      console.log(`Player ${client.sessionId} finished round. (${players.filter(p => p.isFinished).length}/${players.length})`);
      if (players.length === 2 && players.every(p => p.isFinished)) {
        players.forEach(p => p.isFinished = false);
        this.broadcast("start_recap_countdown");
      }
    });

    this.onMessage("player_typing", (client, message: { text: string }) => {
      if (this.state.currentRound === 4) {
        this.broadcast("opponent_typing", { text: message.text }, { except: client });
      }
    });

    this.onMessage("submit_race_answer", async (client, message: { answer: string, session_id: string }) => {
      if (this.state.currentRound !== 4 || !this.state.currentRaceQuestion.id) return;
      
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      
      if (this.raceLockedPlayers.has(client.sessionId)) return;

      const qId = this.state.currentRaceQuestion.id;
      
      const { data: question } = await supabase
        .from('questions')
        .select('target_word')
        .eq('id', qId)
        .single();

      if (!question) return;

      const normalizedAnswer = normalizeAnswer(message.answer);
      const isSkip = normalizedAnswer === "";

      if (isSkip) {
        this.raceLockedPlayers.add(client.sessionId);
        client.send("race_wrong", { playerId: client.sessionId, penalty: 0 }); // send 0 penalty to lock their input locally
        
        if (this.raceLockedPlayers.size === this.state.players.size) {
          this.nextRaceQuestion();
        }
        return;
      }

      const normalizedTarget = normalizeAnswer(question.target_word);

      if (normalizedAnswer === normalizedTarget) {
        if (this.raceQuestionTimer) clearTimeout(this.raceQuestionTimer);
        
        // First correct = 500, Second correct = 250
        const points = this.raceLockedPlayers.size === 0 ? 500 : 250;
        player.score += points;
        
        if (message.session_id) {
          const { data: currentSession } = await supabase.from('game_sessions').select('score, questions_answered').eq('id', message.session_id).single();
          if (currentSession) {
             await supabase.from('game_sessions').update({ 
               score: (currentSession.score || 0) + points,
               questions_answered: (currentSession.questions_answered || 0) + 1 
             }).eq('id', message.session_id);
          }
        }
        
        this.broadcast("race_won", { winnerId: client.sessionId, points });
        this.nextRaceQuestion();
      } else {
        const penalty = 200;
        player.score = Math.max(0, player.score - penalty);
        
        if (message.session_id) {
          const { data: currentSession } = await supabase.from('game_sessions').select('score, questions_answered').eq('id', message.session_id).single();
          if (currentSession) {
             await supabase.from('game_sessions').update({ 
               score: Math.max(0, (currentSession.score || 0) - penalty),
               questions_answered: (currentSession.questions_answered || 0) + 1 
             }).eq('id', message.session_id);
          }
        }
        
        this.raceLockedPlayers.add(client.sessionId);
        this.broadcast("race_wrong", { playerId: client.sessionId, penalty });
        
        if (this.raceLockedPlayers.size === this.state.players.size) {
          this.nextRaceQuestion();
        }
      }
    });

    this.onMessage("ready_next_round", async (client, message: { round?: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.isReady = true;
      }
      const players = Array.from(this.state.players.values());
      console.log(`Player ${client.sessionId} ready for next round. (${players.filter(p => p.isReady).length}/${players.length})`);
      if (players.length === 2 && players.every(p => p.isReady)) {
        players.forEach(p => p.isReady = false);
        this.state.status = "playing";
        
        const targetRound = message?.round || (this.state.currentRound + 1);
        this.state.currentRound = targetRound;

        if (targetRound === 4) {
          // Fetch 20 chaos-random questions
          let { data: ids } = await supabase.from('questions').select('id').eq('topic', 'chaos-random');
          if (!ids || ids.length === 0) {
            // Fallback to any random questions if chaos-random is empty
            const res = await supabase.from('questions').select('id').limit(100);
            ids = res.data;
          }
          if (ids && ids.length > 0) {
            const shuffled = [...ids].sort(() => Math.random() - 0.5).slice(0, 5); // 5 questions limit
            const pickedIds = shuffled.map(r => r.id);
            const { data: questions } = await supabase
              .from('questions')
              .select('id, question_text, target_word, hint')
              .in('id', pickedIds);
            
            if (questions) {
              this.raceQuestions = questions.sort(() => Math.random() - 0.5);
              this.currentRaceQuestionIndex = 0;
              this.broadcast("start_next_round", { round: 4 });
              // Small delay to allow client to show UI before sending first question
              setTimeout(() => {
                this.nextRaceQuestion();
              }, 3000);
            } else {
              this.broadcast("start_next_round", { round: targetRound });
            }
          } else {
            this.broadcast("start_next_round", { round: targetRound });
          }
        } else {
          this.broadcast("start_next_round", { round: targetRound });
        }
      }
    });

    console.log(`MatchRoom created: ${this.roomId}`);
  }

  private nextRaceQuestion() {
    if (this.raceQuestionTimer) clearTimeout(this.raceQuestionTimer);
    this.raceLockedPlayers.clear();

    if (this.currentRaceQuestionIndex >= this.raceQuestions.length) {
      // Out of questions, maybe end the round?
      this.broadcast("start_recap_countdown");
      return;
    }

    const q = this.raceQuestions[this.currentRaceQuestionIndex++];
    
    // Mask question
    this.state.currentRaceQuestion.id = q.id;
    this.state.currentRaceQuestion.question_text = q.question_text;
    this.state.currentRaceQuestion.target_length = q.target_word ? q.target_word.length : 0;
    
    const hints = generateOracleHints(q.target_word || "");
    // ArraySchema requires length assignment or push
    this.state.currentRaceQuestion.oracle_hints.clear();
    hints.forEach(h => this.state.currentRaceQuestion.oracle_hints.push(h));

    // Also broadcast it directly so clients can listen easily
    this.broadcast("next_race_question", {
      id: q.id,
      question_text: q.question_text,
      target_length: q.target_word ? q.target_word.length : 0,
      oracle_hints: hints,
      hint: q.hint
    });

    // 12 seconds timer
    this.raceQuestionTimer = setTimeout(() => {
      this.broadcast("race_timeout");
      this.nextRaceQuestion();
    }, 12000);
  }

  async onAuth(client: Client, options: any, request: any) {
    console.log("onAuth started", options);
    if (!options.token) {
      throw new Error("Authentication required");
    }

    try {
      const decoded = verifyToken(options.token);

      const { data: profile } = await supabase
        .from("players")
        .select("username, avatar_url, session_version, elo")
        .eq("id", decoded.id)
        .single();

      if (!profile) {
        throw new Error("Account not found");
      }

      const tokenVersion = decoded.sessionVersion ?? 0;
      const dbVersion = profile.session_version ?? 0;

      if (dbVersion !== 0 && tokenVersion !== dbVersion) {
        throw new Error("Session expired due to login elsewhere");
      }

      // Auto-abandon any stuck previous sessions
      const { data: activeSessions } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('player_id', decoded.id)
        .in('status', ['waiting', 'playing']);
      
      if (activeSessions && activeSessions.length > 0) {
        for (const s of activeSessions) {
          await supabase.from('game_sessions').update({ status: 'abandoned' }).eq('id', s.id);
        }
      }

      const name = profile.username || "Player";
      const avatar = profile.avatar_url?.trim()
        ? profile.avatar_url
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

      return {
        id: decoded.id,
        name,
        avatar,
        elo: profile.elo ?? 0
      };
    } catch (e: any) {
      console.error("onAuth error!", e);
      throw new Error("Invalid token or failed to fetch profile: " + e.message);
    }
  }

  onJoin(client: Client, options: any) {
    console.log(`${client.sessionId} joined ${this.roomId}`);

    const id = options.id || client.auth?.id || client.userData?.id || client.sessionId;
    const name = options.name || client.auth?.name || client.userData?.name || "Anonymous";
    const avatar = options.avatar || client.auth?.avatar || client.userData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    const elo = options.elo || client.auth?.elo || client.userData?.elo || 1000;

    client.userData = { userId: id };
    addActiveClient(id, client);

    if (this.state.players.size === 0) {
      this.state.hostId = id;
    }

    this.state.players.set(client.sessionId, new Player(id, name, avatar, elo));

    if (this.state.players.size === 2) {
      if (!this.isCustomRoom) {
        console.log(`[MatchRoom ${this.roomId}] 2 players joined! Auto-starting match...`);
        this.state.status = "starting";
        this.broadcast("match_started");
      } else {
        console.log(`[MatchRoom ${this.roomId}] 2 players joined custom room. Waiting for host to start...`);
      }
    }
  }

  async onLeave(client: Client, code?: number) {
    console.log(`${client.sessionId} left ${this.roomId}, code: ${code}`);
    
    if (client.userData?.userId) {
      removeActiveClient(client.userData.userId, client);
    }
    
    const isMatchActive = this.state.status === "playing" || this.state.status === "starting";

    this.state.players.delete(client.sessionId);

    if (isMatchActive) {
      // Immediate forfeit, no reconnection allowed per new requirement
      console.log(`[MatchRoom] Client ${client.sessionId} left during active match. Forfeiting.`);
      this.broadcast("opponent_forfeit", { disconnectedSessionId: client.sessionId }, { except: client });
    }
  }

  onDispose() {
    console.log(`MatchRoom disposed: ${this.roomId}`);
  }
}