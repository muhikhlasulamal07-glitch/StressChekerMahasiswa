require('dotenv').config();

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/chat', async (req, res) => {

    try {

        const { messages } = req.body;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages
        });

        res.json({
            reply: response.choices[0].message.content
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});

app.get('/', (req, res) => {
    res.send('Backend berjalan!');
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server running...');
});