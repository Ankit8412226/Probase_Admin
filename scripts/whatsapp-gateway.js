const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode-terminal");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Map to store active WhatsApp sessions
const sessions = new Map();
const AUTH_BASE_DIR = ".wa_auth";

// Automatically captured dashboard URL to forward webhooks to
let dashboardUrl = "";

app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  if (origin && !origin.includes("localhost:3001") && origin.startsWith("http")) {
    // Clean trailing slash
    dashboardUrl = origin.replace(/\/$/, "");
  }
  next();
});

console.log("Starting Multi-Session WhatsApp Baileys Client...");

async function getOrInitSession(sessionId) {
  if (!sessionId) {
    sessionId = "default";
  }

  if (sessions.has(sessionId)) {
    return sessions.get(sessionId);
  }

  const sessionObj = {
    sock: null,
    qrCodeData: "",
    connectionStatus: "DISCONNECTED",
    isConnecting: false
  };
  sessions.set(sessionId, sessionObj);

  await connectSession(sessionId);
  return sessionObj;
}

async function connectSession(sessionId) {
  const sessionObj = sessions.get(sessionId);
  if (!sessionObj || sessionObj.isConnecting) return;

  sessionObj.isConnecting = true;
  sessionObj.connectionStatus = "INITIALIZING";
  console.log(`[Session: ${sessionId}] Initializing connection...`);

  try {
    const sessionAuthDir = path.join(AUTH_BASE_DIR, sessionId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionAuthDir);

    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["macOS", "Chrome", "121.0.0"]
    });

    sessionObj.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    // Listen to incoming messages and forward via Webhook to Vercel/Next.js!
    sock.ev.on("messages.upsert", async (m) => {
      if (m.type === "notify") {
        for (const msg of m.messages) {
          if (!msg.key.fromMe && msg.message) {
            const senderPhone = msg.key.remoteJid.split("@")[0];
            const senderName = msg.pushName || "WhatsApp User";
            
            // Extract text message content
            const text = msg.message.conversation || 
                         msg.message.extendedTextMessage?.text || 
                         msg.message.imageMessage?.caption || 
                         "";

            const timestamp = msg.messageTimestamp 
              ? new Date(msg.messageTimestamp * 1000).toISOString() 
              : new Date().toISOString();

            console.log(`[Session: ${sessionId}] Received reply from ${senderName} (${senderPhone}): ${text}`);

            if (dashboardUrl) {
              try {
                const webhookEndpoint = `${dashboardUrl}/api/whatsapp/webhook`;
                await fetch(webhookEndpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    senderPhone,
                    senderName,
                    messageText: text,
                    timestamp,
                    sessionId
                  })
                });
              } catch (err) {
                console.error(`[Session: ${sessionId}] Failed to trigger webhook:`, err.message);
              }
            } else {
              console.log(`[Session: ${sessionId}] Dashboard URL not captured yet. Skipping webhook forward.`);
            }
          }
        }
      }
    });

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        sessionObj.qrCodeData = qr;
        sessionObj.connectionStatus = "QR";
        console.log(`[Session: ${sessionId}] New QR code generated.`);
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`[Session: ${sessionId}] Connection closed. Status code: ${statusCode} | Reconnect: ${shouldReconnect}`);
        
        sessionObj.connectionStatus = "DISCONNECTED";
        sessionObj.qrCodeData = "";
        sessionObj.isConnecting = false;
        sessionObj.sock = null;

        if (shouldReconnect) {
          setTimeout(() => connectSession(sessionId), 3000);
        } else {
          clearSessionAuth(sessionId);
          console.log(`[Session: ${sessionId}] Logged out. Reconnecting for fresh QR...`);
          setTimeout(() => connectSession(sessionId), 2000);
        }
      } else if (connection === "open") {
        sessionObj.isConnecting = false;
        sessionObj.connectionStatus = "CONNECTED";
        sessionObj.qrCodeData = "";
        console.log(`[Session: ${sessionId}] WhatsApp client is authenticated and READY!`);
      }
    });
  } catch (err) {
    console.error(`[Session: ${sessionId}] Failed to connect:`, err);
    sessionObj.isConnecting = false;
    sessionObj.connectionStatus = "DISCONNECTED";
    setTimeout(() => connectSession(sessionId), 5000);
  }
}

function clearSessionAuth(sessionId) {
  try {
    const sessionAuthDir = path.join(AUTH_BASE_DIR, sessionId);
    if (fs.existsSync(sessionAuthDir)) {
      fs.rmSync(sessionAuthDir, { recursive: true, force: true });
      console.log(`[Session: ${sessionId}] Auth directory cleared.`);
    }
  } catch (err) {
    console.error(`[Session: ${sessionId}] Failed to clear auth directory:`, err);
  }
}

// --- API Proxy Endpoints ---

app.get("/qr", async (req, res) => {
  const sessionId = req.query.sessionId || "default";
  const session = await getOrInitSession(sessionId);

  if (session.connectionStatus === "QR" && session.qrCodeData) {
    res.json({ qr: session.qrCodeData });
  } else if (session.connectionStatus === "CONNECTED") {
    res.status(400).json({ error: "Already connected" });
  } else {
    res.status(400).json({ error: "QR code not ready yet. Please wait a moment." });
  }
});

app.get("/status", async (req, res) => {
  const sessionId = req.query.sessionId || "default";
  const session = await getOrInitSession(sessionId);
  res.json({ status: session.connectionStatus });
});

app.post("/reset", async (req, res) => {
  const sessionId = req.body.sessionId || "default";
  console.log(`[Session: ${sessionId}] Reset requested.`);

  const session = sessions.get(sessionId);
  if (session) {
    session.connectionStatus = "DISCONNECTED";
    session.qrCodeData = "";
    if (session.sock) {
      try {
        session.sock.ev.removeAllListeners();
        await session.sock.logout();
      } catch (err) {
        console.log(`[Session: ${sessionId}] Logout error (safe to ignore):`, err.message);
      }
      session.sock = null;
    }
    session.isConnecting = false;
  }

  clearSessionAuth(sessionId);
  sessions.delete(sessionId);

  setTimeout(() => getOrInitSession(sessionId), 1500);
  res.json({ success: true, message: `Session ${sessionId} reset. Fresh QR will be available in ~3 seconds.` });
});

// Sends text message or image message with caption
app.post("/send", async (req, res) => {
  const sessionId = req.body.sessionId || "default";
  const { to, message, mediaUrl } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Missing to or message parameters" });
  }

  const session = sessions.get(sessionId);

  if (!session || session.connectionStatus !== "CONNECTED" || !session.sock) {
    return res.status(503).json({ error: `WhatsApp session [${sessionId}] is not authenticated yet.` });
  }

  try {
    const cleanedPhone = to.replace(/[^0-9]/g, "");
    const formattedPhone = `${cleanedPhone}@s.whatsapp.net`;

    if (mediaUrl && mediaUrl.trim().startsWith("http")) {
      // Send image + caption
      await session.sock.sendMessage(formattedPhone, { 
        image: { url: mediaUrl }, 
        caption: message 
      });
      console.log(`[Session: ${sessionId}] [Sent Media Alert to ${to}]: ${mediaUrl} | ${message.replace(/\n/g, " ")}`);
    } else {
      // Send standard text message
      await session.sock.sendMessage(formattedPhone, { text: message });
      console.log(`[Session: ${sessionId}] [Sent Text Alert to ${to}]: ${message.replace(/\n/g, " ")}`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(`[Session: ${sessionId}] Failed to send message:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Auto-boot default session on launch
getOrInitSession("default").catch(err => console.error("Default session boot failed:", err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Multi-Session WhatsApp Gateway Server running on port ${PORT}`);
  if (dashboardUrl) {
    console.log(`Incoming webhooks will be forwarded to ${dashboardUrl}`);
  }
});
