const { db } = require('../firebase');
const { Timestamp } = require('firebase-admin/firestore');
const { getSession, setSession, clearSession } = require('../sessions/sessionManager');
const { generateNextUserId } = require('../utils/generateUserId');

exports.handleMessage = async (bot, msg) => {
    const chatId = msg.chat.id;
    const session = getSession(chatId);

    if (!session || msg.text.startsWith('/')) return;

    if (session.step === 'ask_name') {
        session.name = msg.text;
        session.step = 'ask_phone';
        setSession(chatId, session);
        bot.sendMessage(chatId, 'Telefon raqamini kiriting:');

    } else if (session.step === 'ask_phone') {
        session.phone = msg.text;

        const newUserId = await generateNextUserId();

        const newUser = {
            id: newUserId,
            name: session.name,
            phone: session.phone,
            created_at: Timestamp.fromDate(new Date())
        };

        const loadingMsg = await bot.sendMessage(chatId, '⌛️');
        await db.collection('users').add(newUser);
        await bot.deleteMessage(chatId, loadingMsg.message_id);

        await bot.sendMessage(chatId,
            `Foydalonuvchi qushildi!\nID: ${newUser.id}\nIsm: ${newUser.name}\nTel raqam: ${newUser.phone}`
        );
        clearSession(chatId);

    } else if (session.step === 'get_client_id') {
        const inputId = parseInt(msg.text);
        if (isNaN(inputId)) {
            bot.sendMessage(chatId, 'ID son bulishi kerak. Qayta urunib kuring:');
            return;
        }

        const loadingMsg = await bot.sendMessage(chatId, '⌛️');

        try {
            const query = await db.collection('users').where('id', '==', inputId).limit(1).get();

            await bot.deleteMessage(chatId, loadingMsg.message_id);

            if (query.empty) {
                await bot.sendMessage(chatId, '❌ Bunday ID bilan foydalanuvchi topilmadi.');
            } else {
                const user = query.docs[0].data();
                await bot.sendMessage(chatId,
                    `🔎 Foydalanuvchi Topildi:\nID: ${user.id}\nIsm: ${user.name}\nTel raqam: ${user.phone}`
                );
            }
        } catch (error) {
            await bot.deleteMessage(chatId, loadingMsg.message_id);
            await bot.sendMessage(chatId, '❌ Foydalanuvchini qidirishda xatolik yuz berdi.');
        }

        clearSession(chatId);
    }
};
