const express = require("express");
const router = express.Router();
const { getStatus } = require("../socket");

router.get("/status", async (req, res) => {
  try {
    const response = getStatus();

    res.json({
      success: true,
      message: "Berhasil mendapatkan status terbaru",
      data: response,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal mendapatkan status",
      error: err.message,
    });
  }
});

module.exports = router;
