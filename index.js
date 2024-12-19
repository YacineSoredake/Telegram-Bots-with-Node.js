require('dotenv').config();
const axios = require('axios');
const express = require('express');

// Environment Variables
const { TOKEN, SERVER_URL, PORT = 5000 } = process.env;
if (!TOKEN || !SERVER_URL) {
    throw new Error("Missing required environment variables: TOKEN or SERVER_URL.");
}

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = `${SERVER_URL}${URI}`;

const app = express();
app.use(express.json()); // `express.json()` is the modern alternative to `body-parser.json()`

// Initialize the webhook
const init = async () => {
    try {
        const res = await axios.post(`${TELEGRAM_API}/setWebhook`, { url: WEBHOOK_URL });
        console.log("Webhook set successfully:", res.data);
    } catch (error) {
        console.error("Error setting webhook:", error.response?.data || error.message);
    }
};

// Handle incoming messages
app.post(URI, async (req, res) => {
    try {
        const message = req.body.message;
        if (!message) {
            return res.sendStatus(200); // Gracefully handle non-message updates
        }

        const chatId = message.chat.id;
        const text = message.text || "I can only respond to text messages for now!";

        // Send a reply
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: `You said: "${text}"`
        });

        return res.sendStatus(200); // Respond to Telegram that the update was processed successfully
    } catch (error) {
        console.error("Error processing message:", error.message);
        return res.sendStatus(500); // Inform Telegram of an internal server error
    }
});

// Start the server
app.listen(PORT, async () => {
    console.log(`App running on port ${PORT}`);
    await init();
});
