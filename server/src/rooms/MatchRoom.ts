import { Room, Client } from "colyseus";
import { MatchState, Player } from "./schema/MatchState";
import { verifyToken } from "../utils/jwt";
import { supabase } from "../config/supabase";

export class MatchRoom extends Room<{ state: MatchState }> {
  maxClients = 2;

  onCreate(options: any) {
    this.state = new MatchState();

    this.onMessage("ping", (client, message) => {
      console.log(`Received ping from ${client.sessionId}:`, message);
      client.send("pong", "Server acknowledges ping!");
    });
    
    console.log(`MatchRoom created: ${this.roomId}`);
  }

  async onAuth(client: Client, options: any, request: any) {
    console.log("onAuth started", options);
    if (!options.token) {
      throw new Error("Missing authentication token");
    }

    try {
      const decoded = verifyToken(options.token);
      
      // Fetch user profile from Supabase database
      const { data: profile } = await supabase
        .from("players")
        .select("username, avatar_url")
        .eq("id", decoded.id)
        .single();
      
      const name = profile?.username || "Player";
      const avatar = profile?.avatar_url?.trim()
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
    
    // Use auth data populated from onAuth (Database)
    const id = client.auth?.id || client.sessionId;
    const name = client.auth?.name || "Anonymous";
    const avatar = client.auth?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    
    this.state.players.set(client.sessionId, new Player(id, name, avatar));
  }

  onLeave(client: Client, code?: number) {
    console.log(`${client.sessionId} left ${this.roomId}`);
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log(`MatchRoom disposed: ${this.roomId}`);
  }
}
