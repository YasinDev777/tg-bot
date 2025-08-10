const { setSession } = require('../sessions/sessionManager');
const { db } = require('../firebase');
const { parse } = require('dotenv');

exports.handleGetAllClients = async (bot, msg) => {
    const chatId = msg.chat.id;
    const loadingMsg = await bot.sendMessage(chatId, '⌛️');

    try {
        const snapshot = await db.collection('users').orderBy('id', 'asc').get();

        await bot.deleteMessage(chatId, loadingMsg.message_id);

        if (snapshot.empty) {
            await bot.sendMessage(chatId, '❌ Hozircha foydalanuvchilar yo‘q.');
        } else {
            const users = snapshot.docs.map(doc => doc.data());
            const chunkSize = 10;
            for (let i = 0; i < users.length; i += chunkSize) {
                const chunk = users.slice(i, i + chunkSize);
                let message = '📋 Barcha foydalanuvchilar:\n\n\n';

                chunk.forEach(user => {
                    message += `🆔: <code>${user.id}</code>\n\n👤 Ism: ${user.name}\n\n📞 Telefon raqam: ${user.phone}\n\n\n`;
                });

                await bot.sendMessage(chatId, message, {
                    parse_mode: 'HTML',
                });
            }
        }
    } catch (error) {
        console.error('Error getting clients:', error);
        await bot.deleteMessage(chatId, loadingMsg.message_id);
        await bot.sendMessage(chatId, '❌ Foydalanuvchilarni olishda xatolik yuz berdi.');
    }
};

