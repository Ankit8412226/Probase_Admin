const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode-terminal");
const pino = require("pino");

const app = express();
app.use(express.json());
app.use(cors());

let sock = null;
let qrCodeData = "";
let connectionStatus = "DISCONNECTED";

console.log("Starting WhatsApp Baileys Client session...");

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(".wa_auth");

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
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed, reconnecting:", shouldReconnect);
      connectionStatus = "DISCONNECTED";
      qrCodeData = "";
      if (shouldReconnect) {
        connectToWhatsApp().catch(err => console.error(err));
      }
    } else if (connection === "open") {
      console.log("\n==============================================");
      console.log("WhatsApp Client is authenticated and READY!");
      console.log("==============================================\n");
      connectionStatus = "CONNECTED";
      qrCodeData = "";
    }
  });
}

app.get("/qr", (req, res) => {
  if (connectionStatus === "QR" && qrCodeData) {
    res.json({ qr: qrCodeData });
  } else if (connectionStatus === "CONNECTED") {
    res.status(400).json({ error: "Already connected" });
  } else {
    res.status(400).json({ error: "QR code not ready yet. Please wait a moment." });
  }
});

app.get("/status", (req, res) => {
  res.json({ status: connectionStatus });
});

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
  console.log("Link this in your dashboard settings!");
});
