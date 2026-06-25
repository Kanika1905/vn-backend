// realtime/trackingHub.js
// WebSocket hub for live order tracking.
//   - Clients connect to  ws://<host>/ws/orders/:orderId?token=<JWT>
//   - The JWT is verified (same secret as the REST auth) before upgrade.
//   - broadcastTracking(orderId, payload) pushes an update to every client
//     subscribed to that order. The tracking controller calls it whenever a
//     new driver location arrives.
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

// orderId -> Set<WebSocket>
const rooms = new Map();
let wss = null;

const PATH_RE = /^\/ws\/orders\/([^/?]+)/;

export function initTrackingHub(server) {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    let pathname, token;
    try {
      const parsed = new URL(req.url, "http://localhost");
      pathname = parsed.pathname;
      token = parsed.searchParams.get("token");
    } catch {
      socket.destroy();
      return;
    }

    const match = pathname.match(PATH_RE);
    if (!match) {
      // Not our endpoint — let other upgrade handlers (if any) ignore it.
      socket.destroy();
      return;
    }

    // Reuse the existing token flow — no new auth.
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const orderId = match[1];
    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.orderId = orderId;
      ws.isAlive = true;
      if (!rooms.has(orderId)) rooms.set(orderId, new Set());
      rooms.get(orderId).add(ws);

      ws.send(JSON.stringify({ type: "connected", orderId }));

      ws.on("pong", () => { ws.isAlive = true; });
      ws.on("close", () => removeClient(orderId, ws));
      ws.on("error", () => removeClient(orderId, ws));
    });
  });

  // Heartbeat: drop dead connections so rooms don't leak.
  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      try { ws.ping(); } catch {}
    });
  }, 30000);
  interval.unref?.();
}

function removeClient(orderId, ws) {
  const set = rooms.get(orderId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) rooms.delete(orderId);
}

export function broadcastTracking(orderId, payload) {
  const set = rooms.get(String(orderId));
  if (!set || set.size === 0) return;
  const msg = JSON.stringify({ type: "location", ...payload });
  for (const ws of set) {
    if (ws.readyState === 1 /* OPEN */) {
      try { ws.send(msg); } catch {}
    }
  }
}
