const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const authMiddleware = require("../middleware/authMiddleware");

// Get logged-in user's chats
router.get("/", authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({
      user: req.user.id,
    }).sort({ createdAt: 1 });

    res.json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;