require("dotenv").config();
const mongoose = require("mongoose");
const Chat = require("./models/Chat");
const authMiddleware = require("./middleware/authMiddleware");
console.log(process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

const express = require("express");
const cors = require("cors");
const {Groq} = require("groq-sdk");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

const allowedTopics = [
  "order",
  "refund",
  "return",
  "shipping",
  "delivery",
  "product",
  "support",
  "payment",
  "cancel",
  "exchange",
  "replace",
  "track",
  "customer",
];

const isCustomerSupport = allowedTopics.some((topic) =>
  message.toLowerCase().includes(topic)
);

if (!isCustomerSupport) {
  return res.json({
    reply:
      "I'm a Customer Support Assistant. I can only help with orders, refunds, products, shipping, returns, payments, and customer support.",
  });
}

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI Customer Support Assistant.

Your job is to help customers with:
- Order status
- Refunds
- Product information
- Shipping
- Returns
- Contact support

If the user asks anything unrelated to customer support (such as politics, current affairs, sports, movies, coding, math, or general knowledge), politely reply:

"I'm a Customer Support Assistant, so I can only help with customer support questions such as orders, refunds, products, shipping, and returns."

Always be polite and keep your answers short.`
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const reply = chatCompletion.choices[0].message.content;

await Chat.create({
   user: req.user.id,
  message: message,
  reply: reply,
});

res.json({
  reply: reply,
});
  } catch (error) {
    console.error(error);
    res.json({
      reply: "Sorry, something went wrong.",
    });
  }
});

const PORT = 5000;
console.log("Before app.listen");

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});