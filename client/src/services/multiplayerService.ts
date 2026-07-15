import { Client, Room } from "colyseus.js";

// Ensure the Colyseus connection points to the correct backend host
const host = window.document.location.host.replace(/:.*/, "");
const port = 3000;
const protocol = window.location.protocol.replace("http", "ws");
const endpoint = import.meta.env.VITE_WS_URL || `${protocol}//${host}:${port}`;

export const colyseusClient = new Client(endpoint);
export let currentRoom: Room | null = null;

export async function createMatchRoom(options: any = {}) {
  try {
    currentRoom = await colyseusClient.create("match_room", options);
    console.log("Created room successfully!", currentRoom.id);
    setupRoomListeners(currentRoom);
    return currentRoom;
  } catch (e) {
    console.error("Create room error:", e);
    throw e;
  }
}

export async function joinMatchRoomById(roomId: string, options: any = {}) {
  try {
    currentRoom = await colyseusClient.joinById(roomId, options);
    console.log("Joined room successfully!", currentRoom.id);
    setupRoomListeners(currentRoom);
    return currentRoom;
  } catch (e) {
    console.error("Join room error:", e);
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
}

export function leaveMatchRoom() {
  if (currentRoom) {
    currentRoom.leave();
    currentRoom = null;
  }
}
