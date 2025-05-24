const express = require("express");
const router = express.Router();
const { generateQRCode, getStatus } = require("../socket");

router.get("/generateQR", async (req, res) => {
  try {
    const status = getStatus();

    if (status.status === "connected") {
      return res.status(400).json({
        success: false,
        message: "Sudah terkoneksi, tidak perlu generate QR baru.",
      });
    }

    const response = await generateQRCode();

    res.json({
      success: true,
      message: "Berhasil generate qr code baru",
      data: response,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal generate qr baru",
      error: err.message,
    });
  }
});

module.exports = router;
