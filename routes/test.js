// routes/test.js
const express = require("express");
const router = express.Router();

router.get("/ping", (req, res) => {
  res.json({ success: true, message: "pong" });
});

module.exports = router;
