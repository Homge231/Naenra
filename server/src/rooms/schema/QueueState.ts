import { Schema, MapSchema, type } from "@colyseus/schema";

export class QueuePlayer extends Schema {
  @type("string") sessionId: string;
  @type("string") userId: string;
  @type("number") elo: number;
  @type("number") joinedAt: number;

  constructor(sessionId: string, userId: string, elo: number) {
    super();
    this.sessionId = sessionId;
    this.userId = userId;
    this.elo = elo;
    this.joinedAt = Date.now();
  }
}

export class QueueState extends Schema {
  @type({ map: QueuePlayer }) players = new MapSchema<QueuePlayer>();
}
