import { Room, Client, matchMaker } from "colyseus";
import { QueueState, QueuePlayer } from "./schema/QueueState";
import { verifyToken } from "../utils/jwt";
import { supabase } from "../config/supabase";

export class QueueRoom extends Room<{ state: QueueState }> {
  matchmakingInterval: any;

  async onCreate(options: any) {
    this.setState(new QueueState());

    this.onMessage("cancel_queue", (client) => {
      this.state.players.delete(client.sessionId);
      console.log(`[QueueRoom] Player ${client.sessionId} canceled queue.`);
      client.leave();
    });

    this.setSimulationInterval(() => this.matchmakingLoop(), 1000);
    console.log(`QueueRoom created!`);
  }

  async onAuth(client: Client, options: any, request: any) {
    if (!options.token) {
      throw new Error("Authentication required");
    }

    try {
      const decoded = verifyToken(options.token);

      const { data: profile } = await supabase
        .from("players")
        .select("id, elo")
        .eq("id", decoded.id)
        .single();

      if (!profile) {
        throw new Error("Account not found");
      }

      return {
        id: decoded.id,
        elo: profile.elo || 1000
      };
    } catch (e) {
      console.error("[QueueRoom] onAuth Error", e);
      throw e;
    }
  }

  onJoin(client: Client, options: any) {
    console.log(`[QueueRoom] ${client.sessionId} joined queue.`);
    const elo = client.auth?.elo || 1000;
    const userId = client.auth?.id || client.sessionId;
    this.state.players.set(client.sessionId, new QueuePlayer(client.sessionId, userId, elo));
  }

  async matchmakingLoop() {
    const players = Array.from(this.state.players.values()) as QueuePlayer[];
    if (players.length < 2) return;

    // Log the current matchmaking state
    console.log(`[QueueRoom] Tick: ${players.length} players in queue. Elos:`, players.map(p => p.elo));

    // A set of sessionId strings that have already been matched in this tick
    const matched = new Set<string>();

    for (let i = 0; i < players.length; i++) {
      const p1 = players[i];
      if (matched.has(p1.sessionId)) continue;

      const p1WaitTime = Date.now() - p1.joinedAt;
      let p1Threshold = 100;
      if (p1WaitTime > 15000) p1Threshold = 9999;
      else if (p1WaitTime > 10000) p1Threshold = 600;
      else if (p1WaitTime > 5000) p1Threshold = 300;

      for (let j = i + 1; j < players.length; j++) {
        const p2 = players[j];
        if (matched.has(p2.sessionId)) continue;

        const p2WaitTime = Date.now() - p2.joinedAt;
        let p2Threshold = 100;
        if (p2WaitTime > 15000) p2Threshold = 9999;
        else if (p2WaitTime > 10000) p2Threshold = 600;
        else if (p2WaitTime > 5000) p2Threshold = 300;

        // Use the looser threshold of the two
        const maxThreshold = Math.max(p1Threshold, p2Threshold);
        const eloDiff = Math.abs(p1.elo - p2.elo);

        if (eloDiff <= maxThreshold) {
          // Found a match!
          matched.add(p1.sessionId);
          matched.add(p2.sessionId);

          try {
            // Create a new match room for these two players
            const matchRoom = await matchMaker.createRoom("match_room", { isCustom: false });
            console.log(`[QueueRoom] Created matchRoom ${matchRoom.roomId}`);
            
            const client1 = this.clients.getById(p1.sessionId) || this.clients.find(c => c.sessionId === p1.sessionId);
            const client2 = this.clients.getById(p2.sessionId) || this.clients.find(c => c.sessionId === p2.sessionId);

            console.log(`[QueueRoom] Found clients? c1: ${!!client1}, c2: ${!!client2}`);

            if (client1) {
              client1.send("match_found", { roomId: matchRoom.roomId });
              this.state.players.delete(p1.sessionId);
            }
            if (client2) {
              client2.send("match_found", { roomId: matchRoom.roomId });
              this.state.players.delete(p2.sessionId);
            }

            console.log(`[QueueRoom] Matched ${p1.userId} and ${p2.userId} in room ${matchRoom.roomId} (Elo diff: ${eloDiff})`);
          } catch (e) {
            console.error("[QueueRoom] Failed to create match room", e);
          }
          break; // move to next p1
        }
      }
    }
  }

  onLeave(client: Client, code?: number) {
    this.state.players.delete(client.sessionId);
    console.log(`[QueueRoom] ${client.sessionId} left queue.`);
  }

  onDispose() {
    console.log("QueueRoom disposed.");
  }
}
