import { Room, Client } from "colyseus";
import { MatchState, Player } from "./schema/MatchState";
import { verifyToken } from "../utils/jwt";
import { supabase } from "../config/supabase";

export class MatchRoom extends Room<{ state: MatchState }> {
  maxClients = 2;
  private isCustomRoom: boolean = false;

  onCreate(options: any) {
    this.state = new MatchState();
    this.isCustomRoom = options.isCustom === true;


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
        player.isReady = true;
      }
      const players = Array.from(this.state.players.values());
      console.log(`Player ${client.sessionId} finished round. (${players.filter(p => p.isReady).length}/${players.length})`);
      if (players.length === 2 && players.every(p => p.isReady)) {
        players.forEach(p => p.isReady = false);
        this.broadcast("start_recap_countdown");
      }
    });

    this.onMessage("ready_next_round", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.isReady = true;
      }
      const players = Array.from(this.state.players.values());
      console.log(`Player ${client.sessionId} ready for next round. (${players.filter(p => p.isReady).length}/${players.length})`);
      if (players.length === 2 && players.every(p => p.isReady)) {
        players.forEach(p => p.isReady = false);
        this.state.status = "playing";
        this.broadcast("start_next_round");
      }
    });

    console.log(`MatchRoom created: ${this.roomId}`);
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
        .select("username, avatar_url, session_version")
        .eq("id", decoded.id)
        .single();

      if (!profile) {
        throw new Error("Account not found");
      }

      if (profile.session_version !== decoded.sessionVersion) {
        throw new Error("Session expired due to login elsewhere");
      }

      // Prevent matching with oneself in the same room
      const isAlreadyInRoom = Array.from(this.state.players.values()).some(p => p.id === decoded.id);
      if (isAlreadyInRoom) {
        throw new Error("Cannot match with yourself");
      }

      const name = profile.username || "Player";
      const avatar = profile.avatar_url?.trim()
        ? profile.avatar_url
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

      return {
        id: decoded.id,
        name,
        avatar
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

    if (this.state.players.size === 0) {
      this.state.hostId = id;
    }

    this.state.players.set(client.sessionId, new Player(id, name, avatar));

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