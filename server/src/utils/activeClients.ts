import { Client } from 'colyseus';

export const activeClientsByUserId = new Map<string, Set<Client>>();

export function addActiveClient(userId: string, client: Client) {
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
