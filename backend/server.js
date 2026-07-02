require("dotenv").config();

const express = require("express");
const cors = require("cors");
const {Groq} = require("groq-sdk");

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a friendly AI customer support assistant. Give short, helpful replies.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    res.json({
      reply: chatCompletion.choices[0].message.content,
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