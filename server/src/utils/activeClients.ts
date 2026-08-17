import { Client } from 'colyseus';

export const activeClientsByUserId = new Map<string, Set<Client>>();
export const userLastSeenMap = new Map<string, number>();

export function touchUserActivity(userId: string) {
  if (!userId) return;
  userLastSeenMap.set(userId, Date.now());
}

export function isUserOnline(userId: string): boolean {
  if (!userId) return false;
  const lastSeen = userLastSeenMap.get(userId);
  if (lastSeen && Date.now() - lastSeen < 60 * 1000) { // Active within last 60 seconds
    return true;
  }
  const socketClients = activeClientsByUserId.get(userId);
  if (socketClients && socketClients.size > 0) {
    return true;
  }
  return false;
}

export function getOnlineUserIds(): Set<string> {
  const onlineIds = new Set<string>();
  const now = Date.now();
  const threshold = 60 * 1000; // 60 seconds

  for (const [userId, lastSeen] of userLastSeenMap.entries()) {
    if (now - lastSeen < threshold) {
      onlineIds.add(userId);
    }
  }

  for (const [userId, sockets] of activeClientsByUserId.entries()) {
    if (sockets.size > 0) {
      onlineIds.add(userId);
    }
  }

  return onlineIds;
}

export function addActiveClient(userId: string, client: Client) {
  touchUserActivity(userId);
  if (!activeClientsByUserId.has(userId)) {
    activeClientsByUserId.set(userId, new Set());
  }
  activeClientsByUserId.get(userId)!.add(client);
}

export function removeActiveClient(userId: string, client: Client) {
  const set = activeClientsByUserId.get(userId);
  if (set) {
    set.delete(client);
    if (set.size === 0) {
      activeClientsByUserId.delete(userId);
    }
  }
}

export function kickUserClients(userId: string, code = 4001) {
  userLastSeenMap.delete(userId);
  const set = activeClientsByUserId.get(userId);
  if (set) {
    for (const client of set) {
      try {
        client.leave(code);
      } catch (e) {
        console.error("[kickUserClients] Error kicking client:", e);
      }
    }
  }
}
