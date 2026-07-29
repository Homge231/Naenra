import { Client, Room } from "@colyseus/sdk";
import { MatchState } from "../game/schema/MatchState";

// Ensure the Colyseus connection points to the correct backend host
const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
const endpoint = serverUrl.replace(/^http/, "ws");

export const colyseusClient = new Client(endpoint);


export let currentRoom: Room<MatchState> | null = null;
export let queueRoom: Room | null = null;

function saveReconnectionToken(room: Room) {
  if (room && room.reconnectionToken) {
    sessionStorage.setItem('naenra_reconnection_token', room.reconnectionToken);
  }
}

function clearReconnectionToken() {
  sessionStorage.removeItem('naenra_reconnection_token');
}

export function getSavedReconnectionToken(): string | null {
  return sessionStorage.getItem('naenra_reconnection_token');
}

export async function joinOrCreateQueueRoom(options: any = {}) {
  try {
    queueRoom = await colyseusClient.joinOrCreate("queue_room", options);
    console.log("Joined queue room successfully!", queueRoom.roomId);

    queueRoom.onLeave((code) => {
      console.log("QueueRoom left with code:", code);
      if (code === 4001) {
        sessionStorage.setItem('arena_force_logged_out', '1');
        window.location.href = '/login?reason=session_invalidated';
      }
    });

    return queueRoom;
  } catch (e) {
    console.error("JoinOrCreate queue room error:", e);
    throw e;
  }
}

export async function joinOrCreateMatchRoom(options: any = {}) {
  try {
    currentRoom = await colyseusClient.joinOrCreate<MatchState>("match_room", options);
    console.log("Joined or created match room successfully!", currentRoom.roomId);
    saveReconnectionToken(currentRoom);
    setupRoomListeners(currentRoom);
    return currentRoom;
  } catch (e) {
    console.error("JoinOrCreate room error:", e);
    throw e;
  }
}

export async function createMatchRoom(options: any = {}) {
  try {
    currentRoom = await colyseusClient.create<MatchState>("match_room", options);
    console.log("Created room successfully!", currentRoom.roomId);
    saveReconnectionToken(currentRoom);
    setupRoomListeners(currentRoom);
    return currentRoom;
  } catch (e) {
    console.error("Create room error:", e);
    throw e;
  }
}

export async function joinMatchRoomById(roomId: string, options: any = {}) {
  try {
    currentRoom = await colyseusClient.joinById<MatchState>(roomId, options);
    console.log("Joined room successfully!", currentRoom.roomId);
    saveReconnectionToken(currentRoom);
    setupRoomListeners(currentRoom);
    return currentRoom;
  } catch (e) {
    console.error("Join room error:", e);
    throw e;
  }
}

export async function reconnectMatchRoom(reconnectionToken?: string) {
  const token = reconnectionToken || getSavedReconnectionToken();
  if (!token) {
    throw new Error("No reconnection token found");
  }

  try {
    currentRoom = await colyseusClient.reconnect<MatchState>(token);
    console.log("Reconnected to room successfully!", currentRoom.roomId);
    saveReconnectionToken(currentRoom);
    setupRoomListeners(currentRoom);
    return currentRoom;
  } catch (e) {
    console.error("Reconnection failed:", e);
    clearReconnectionToken();
    throw e;
  }
}

function setupRoomListeners(room: Room) {
  room.onStateChange((state) => {
    console.log("Room state changed:", state);
  });

  room.onMessage("pong", (message) => {
    console.log("Received pong from server:", message);
  });

  room.onLeave((code) => {
    console.log("MatchRoom left with code:", code);
    if (code === 4001) {
      sessionStorage.setItem('arena_force_logged_out', '1');
      window.location.href = '/login?reason=session_invalidated';
    }
  });
}

export function leaveMatchRoom() {
  clearReconnectionToken();
  if (currentRoom) {
    currentRoom.leave();
    currentRoom = null;
  }
}
