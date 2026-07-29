import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class RoomMetadata extends Schema {
  @type("string") vocabularyLevel: string = "Normal";
  @type("string") difficulty: string = "Standard";
  @type("string") topic: string = "Any";
}

export class RaceQuestion extends Schema {
  @type("string") id: string;
  @type("string") question_text: string;
  @type("number") target_length: number;
  @type(["string"]) oracle_hints = new ArraySchema<string>();
}

export class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("string") avatar: string;
  @type("number") elo: number = 1000;
  @type("boolean") isReady: boolean = false;
  @type("boolean") isFinished: boolean = false;
  @type("number") score: number = 0;
  @type("string") activeCoreId: string = "";
  
  constructor(id: string, name: string, avatar: string, elo: number = 1000) {
    super();
    this.id = id;
    this.name = name;
    this.avatar = avatar;
    this.elo = elo;
  }
}

export class MatchState extends Schema {
  @type("string") status: string = "waiting"; // waiting, playing, finished
  @type("boolean") isCustom: boolean = false;
  @type("string") hostId: string = ""; // Identifies the room host
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(RoomMetadata) metadata = new RoomMetadata();
  @type("number") currentRound: number = 1;
  @type(RaceQuestion) currentRaceQuestion = new RaceQuestion();
}
