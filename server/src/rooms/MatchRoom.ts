import { Room, Client } from "colyseus";
import { MatchState, Player } from "./schema/MatchState";

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

  onJoin(client: Client, options: any) {
    console.log(`${client.sessionId} joined ${this.roomId}`);
    
    // options should contain user profile info from the frontend
    const id = options.id || client.sessionId;
    const name = options.name || "Anonymous";
    const avatar = options.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest";
    
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
