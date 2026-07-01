const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

let qrCodeData = "";
let connectionStatus = "DISCONNECTED";

console.log("Starting WhatsApp Web Client session...");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrCodeData = qr;
  connectionStatus = "QR";
  console.log("\n--- WhatsApp QR Code (Scan with your phone) ---");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  connectionStatus = "CONNECTED";
  qrCodeData = "";
  console.log("\n==============================================");
  console.log("WhatsApp Client is authenticated and READY!");
  console.log("==============================================\n");
});

client.on("authenticated", () => {
  console.log("Session authenticated successfully.");
});

client.on("auth_failure", (msg) => {
  console.error("Session authentication failed:", msg);
});

client.on("disconnected", (reason) => {
  console.log("WhatsApp client disconnected:", reason);
  connectionStatus = "DISCONNECTED";
  qrCodeData = "";
});

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

  if (connectionStatus !== "CONNECTED") {
    return res.status(503).json({ error: "WhatsApp gateway client is not authenticated yet." });
  }

  try {
    // Format phone to WhatsApp standard format: e.g. "+91 99999-99999" -> "919999999999@c.us"
    const cleanedPhone = to.replace(/[^0-9]/g, "");
    const formattedPhone = `${cleanedPhone}@c.us`;

    await client.sendMessage(formattedPhone, message);
    console.log(`[Sent Alert to ${to}]: ${message.replace(/\n/g, " ")}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to send message:", err);
    res.status(500).json({ error: err.message });
  }
});

client.initialize();

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`WhatsApp Gateway Server running on http://localhost:${PORT}`);
  console.log("Link this in your dashboard settings!");
});
