const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

let sock;
let currentQR = null;
let connectionStatus = "disconnected";
let qrTimeout;
let qrCooldownActive = true;
let reconnectTimer = null;

async function connectSocket() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  sock = makeWASocket({
    auth: state,
    logger: logger,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on(
    "connection.update",
    async ({ connection, lastDisconnect, qr }) => {
      if (qr && !qrCooldownActive) {
        qrCooldownActive = true;
        await handleQRCode(qr);
      }

      if (connection === "open") {
        connectionStatus = "connected";
        currentQR = null;
        qrCooldownActive = false;
        clearTimeout(qrTimeout);
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
      } else if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        connectionStatus = "disconnected";

        reconnectTimer = setTimeout(() => {
          if (code === DisconnectReason.loggedOut) {
            console.log("🔒 Logout permanen. Hapus session & scan ulang.");
            const sessionPath = path.resolve("session");
            if (fs.existsSync(sessionPath)) {
              fs.rmSync(sessionPath, { recursive: true, force: true });
            }

            sock = null;
          }
          console.log("🔁 Mencoba reconnect...");
          connectSocket();
        }, 3000); // tunggu 3 detik sebelum reconnect
      }
    }
  );

  //MENERIMA PESAN
  // sock.ev.on("messages.upsert", (m) => {
  //   const message = m.messages[0];
  //   if (message && !message.key.fromMe) {
  //     console.log(
  //       `📩 Pesan masuk dari ${message.key.remoteJid}: ${message.message.conversation}`
  //     );
  //   }
  // });
}

function getSocket() {
  return sock;
}

function getStatus() {
  return {
    status: connectionStatus,
  };
}

async function generateQRCode() {
  qrCooldownActive = false;
  await connectSocket();

  // Tunggu QR muncul atau timeout 5 detik
  const maxWait = 5000;
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (currentQR) {
        clearInterval(interval);
        resolve({ qr: currentQR });
        qrCooldownActive = true;
      } else if (Date.now() - start > maxWait) {
        clearInterval(interval);
        reject(new Error("QR code tidak tersedia dalam batas waktu."));
      }
    }, 200);
  });
}

async function handleQRCode(qr) {
  try {
    currentQR = await QRCode.toDataURL(qr);
    console.log("📱 QR baru tersedia (siap di-scan)");
  } catch (err) {
    console.error("❌ Gagal membuat QR image:", err);
    currentQR = null;
  }

  clearTimeout(qrTimeout);
  qrTimeout = setTimeout(() => {
    currentQR = null;
    qrCooldownActive = false;
    console.log("⏳ QR expired");
  }, 60000);
}

module.exports = {
  connectSocket,
  getSocket,
  getStatus,
  generateQRCode,
};
