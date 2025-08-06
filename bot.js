require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { db } = require('./firebase');
const { Timestamp } = require('firebase-admin/firestore');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const userSessions = {};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Choose action:', {
        reply_markup: {
            keyboard: [
                ['/newClient']
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    });
});

bot.onText(/\/newClient/, (msg) => {
    const chatId = msg.chat.id;
    userSessions[chatId] = { step: 'ask_name' };
    bot.sendMessage(chatId, 'Ism, familiya kiriting:');
});



bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const session = userSessions[chatId];

    if (!session || msg.text.startsWith('/')) return;

    if (session.step === 'ask_name') {
        session.name = msg.text;
        session.step = 'ask_phone';
        bot.sendMessage(chatId, 'Telefon raqamini kiriting:');
    } else if (session.step === 'ask_phone') {
        session.phone = msg.text;

        // Получение последнего клиента по created_at
        const snapshot = await db.collection('users')
            .orderBy('created_at', 'desc')
            .limit(1)
            .get();

        let lastId = 1200;
        if (!snapshot.empty) {
            const lastDoc = snapshot.docs[0].data();
            const prevId = parseInt(lastDoc.id);
            lastId = (prevId % 100 === 99) ? prevId + 2 : prevId + 1;
        } else {
            lastId += 1;
        }

        const newUser = {
            id: lastId,
            name: session.name,
            phone: session.phone,
            created_at: Timestamp.fromDate(new Date())
        };
        const loadingMsg = await bot.sendMessage(chatId, '⌛️');
        await db.collection('users').add(newUser);
        await bot.deleteMessage(chatId, loadingMsg.message_id);
        await bot.sendMessage(chatId, `Foydalonuvchi qushildi!\nID: ${newUser.id}\nIsm: ${newUser.name}\nTel raqam: ${newUser.phone}`);
        delete userSessions[chatId];
    }
});


// start bot polling
bot.launch();

// optional express to keep Render Web Service alive
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_, res) => res.send('Bot is running.'));
app.listen(port, () => console.log(`Listening on port ${port}`));