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

let sock = null;
let qrCodeData = "";
let connectionStatus = "DISCONNECTED";
let isConnecting = false;

const AUTH_DIR = ".wa_auth";

console.log("Starting WhatsApp Baileys Client session...");

async function connectToWhatsApp() {
  if (isConnecting) return;
  isConnecting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCodeData = qr;
        connectionStatus = "QR";
        console.log("\n--- WhatsApp QR Code (Scan with your phone) ---");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log("Connection closed. Status code:", statusCode, "| Reconnect:", shouldReconnect);
        connectionStatus = "DISCONNECTED";
        qrCodeData = "";
        isConnecting = false;
        sock = null;

        if (shouldReconnect) {
          // Auto-reconnect after brief delay (NOT after logout)
          setTimeout(() => connectToWhatsApp(), 3000);
        } else {
          // Logged out — clear saved session so fresh QR appears automatically
          clearAuthDir();
          console.log("Session logged out. Auth cleared. Reconnecting for fresh QR...");
          setTimeout(() => connectToWhatsApp(), 2000);
        }
      } else if (connection === "open") {
        isConnecting = false;
        console.log("\n==============================================");
        console.log("WhatsApp Client is authenticated and READY!");
        console.log("==============================================\n");
        connectionStatus = "CONNECTED";
        qrCodeData = "";
      }
    });
  } catch (err) {
    console.error("Connection error:", err);
    isConnecting = false;
    setTimeout(() => connectToWhatsApp(), 5000);
  }
}

function clearAuthDir() {
  try {
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      console.log("Auth directory cleared.");
    }
  } catch (err) {
    console.error("Failed to clear auth dir:", err);
  }
}

// --- API Endpoints ---

// Get current QR
app.get("/qr", (req, res) => {
  if (connectionStatus === "QR" && qrCodeData) {
    return res.json({ qr: qrCodeData });
  } else if (connectionStatus === "CONNECTED") {
    return res.status(400).json({ error: "Already connected" });
  } else {
    return res.status(400).json({ error: "QR code not ready yet. Please wait a moment." });
  }
});

// Get connection status
app.get("/status", (req, res) => {
  res.json({ status: connectionStatus });
});

// RESET — clear session and regenerate fresh QR (NO REDEPLOY NEEDED)
app.post("/reset", async (req, res) => {
  console.log("Reset requested. Disconnecting and clearing session...");

  connectionStatus = "DISCONNECTED";
  qrCodeData = "";

  if (sock) {
    try {
      sock.ev.removeAllListeners();
      await sock.logout();
    } catch (err) {
      console.error("Logout error (safe to ignore):", err.message);
    }
    sock = null;
  }

  isConnecting = false;
  clearAuthDir();

  // Reconnect fresh — new QR will be generated in ~2-3 seconds
  setTimeout(() => connectToWhatsApp(), 1500);

  res.json({ success: true, message: "Session cleared. Fresh QR will be available in ~3 seconds." });
});

// Send message
app.post("/send", async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: "Missing to or message" });
  }

  if (connectionStatus !== "CONNECTED" || !sock) {
    return res.status(503).json({ error: "WhatsApp gateway client is not authenticated yet." });
  }

  try {
    const cleanedPhone = to.replace(/[^0-9]/g, "");
    const formattedPhone = `${cleanedPhone}@s.whatsapp.net`;
    await sock.sendMessage(formattedPhone, { text: message });
    console.log(`[Sent Alert to ${to}]: ${message.replace(/\n/g, " ")}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to send message:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start connecting
connectToWhatsApp().catch(err => console.error("Initialization failed:", err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`WhatsApp Gateway Server running on port ${PORT}`);
  console.log("API Endpoints: /qr, /status, /send, /reset");
});
