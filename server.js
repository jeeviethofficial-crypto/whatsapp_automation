import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "my_secret_token_123";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Conversation history cache per phone number: { [phone]: Array<{ role: string, parts: Array<{ text: string }> }> }
const conversationHistory = new Map();
const MAX_HISTORY_MESSAGES = 10;

// Tamil Tea Shop System Instruction
const SYSTEM_INSTRUCTION = `
You are the warm, polite, and helpful virtual assistant for "தமிழ் டீ கடை" (Tamil Tea Shop).
Your role is to chat with customers on WhatsApp, introduce the menu, take food/drink orders, calculate totals, and answer questions.

Tone & Language:
- Be warm, welcoming, and polite (use Tamil greetings like "வணக்கம்!", "வாங்க!").
- Respond in the language preferred by the customer:
  - If the customer texts in Tamil, reply in friendly Tamil.
  - If the customer texts in Tanglish (Tamil in English letters), reply in clear Tanglish or Tamil.
  - If the customer texts in English, reply in English.
- Use neat WhatsApp formatting (bullet points, bold text, emojis like ☕, 🫖, 🥟).

Menu & Pricing:
[Teas / டீ வகைகள்]
- Normal Tea / சாதா டீ: ₹12
- Masala Tea / மசாலா டீ: ₹15
- Ginger Tea / இஞ்சி டீ: ₹15
- Cardamom Tea / ஏலக்காய் டீ: ₹15
- Lemon Tea / லெமன் டீ: ₹15
- Green Tea / கிரீன் டீ: ₹20
- Sulaimani Tea / சுலைமானி டீ: ₹15

[Coffees / காபி வகைகள்]
- Filter Coffee / பில்டர் காபி: ₹20
- Sukku Coffee / சுக்கு காபி: ₹20
- Black Coffee / பிளாக் காபி: ₹15

[Snacks & Bakery / சிற்றுண்டி]
- Medu Vadai / மெது வடை: ₹10
- Masala Vadai / மசால் வடை: ₹10
- Samosa / சமோசா: ₹15
- Onion / Potato Bajji (பஜ்ஜி): ₹10
- Bun Butter Jam: ₹25
- Tea Cake / Biscuits: ₹10

Order Taking Workflow:
1. When a customer orders items, confirm each item with count and unit price, then provide the total bill amount (₹).
2. Ask whether it is for Dine-in (கடையிலேயே), Takeaway (பார்சல்), or Delivery.
3. Keep the response concise and readable on mobile screens.
`;

// Root Route
app.get("/", (req, res) => {
    res.send("Tamil Tea Shop WhatsApp AI Server is Running Live! ☕");
});

// 1. Meta Webhook Verification (GET)
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified successfully.");
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
});

// 2. Incoming Messages Listener (POST)
app.post("/webhook", async (req, res) => {
    const body = req.body;

    if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from;
        const userText = message.text?.body;

        if (userText) {
            console.log(`Received message from ${from}: "${userText}"`);
            const aiReply = await getGeminiResponse(from, userText);
            await sendWhatsAppMessage(from, aiReply);
        }
        return res.sendStatus(200);
    }
    res.sendStatus(404);
});

// Gemini API Function with Conversation Memory & Model Fallback
async function getGeminiResponse(userId, prompt) {
    // Get existing conversation history
    const history = conversationHistory.get(userId) || [];

    // Fallback models in priority order
    const models = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];

    const userMessageContent = {
        role: "user",
        parts: [{ text: prompt }]
    };

    const fullContents = [...history, userMessageContent];

    for (const model of models) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: fullContents,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    temperature: 0.7
                }
            });

            const replyText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
            if (replyText) {
                // Update conversation history
                history.push(userMessageContent);
                history.push({
                    role: "model",
                    parts: [{ text: replyText }]
                });

                // Keep only the most recent messages to prevent token bloat
                if (history.length > MAX_HISTORY_MESSAGES) {
                    history.splice(0, history.length - MAX_HISTORY_MESSAGES);
                }
                conversationHistory.set(userId, history);

                return replyText;
            }
        } catch (error) {
            console.warn(`Model ${model} failed:`, error.message);
            continue;
        }
    }

    return "வணக்கம்! மன்னிக்கவும், AI சர்வரில் நெரிசல் அதிகமாக உள்ளது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும். ☕";
}

// WhatsApp Message Sender
async function sendWhatsAppMessage(to, text) {
    try {
        await axios.post(
            `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                text: { body: text }
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log(`Successfully sent message to ${to}`);
    } catch (error) {
        console.error("WhatsApp Send Error:", error.response?.data || error.message);
    }
}

app.listen(PORT, () => console.log(`Tamil Tea Shop WhatsApp Server running on port ${PORT}`));