const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getSocket } = require("../socket");

const upload = multer();

router.post("/send", upload.none(), async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res
      .status(400)
      .json({ success: false, message: "number dan message wajib diisi" });
  }

  const jid = number.includes("@c.us") ? number : `${number}@c.us`;
  const sock = getSocket();

  try {
    await sock.sendMessage(jid, { text: message });
    res.json({ success: true, message: "Pesan berhasil dikirim" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal kirim pesan",
      error: err.message,
    });
  }
});

module.exports = router;
