const { db } = require('../firebase');
const { Timestamp } = require('firebase-admin/firestore');
const { getSession, setSession, clearSession } = require('../sessions/sessionManager');
const { generateNextUserId } = require('../utils/generateUserId');
const { getUserOnce, addUser } = require('../utils/firebaseOnceWorkingFx');

const safeDeleteMessage = async (bot, chatId, messageId) => {
  try {
    await bot.deleteMessage(chatId, messageId);
  } catch (error) {
    if (error.response?.body?.description?.includes('message to delete not found')) {
      console.warn('⚠ Сообщение уже удалено или не найдено, пропускаем.');
      return;
    }
    console.error('Ошибка при удалении сообщения:', error.message);
  }
};


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
        await addUser(newUser);
        await safeDeleteMessage(bot, chatId, loadingMsg.message_id);

        await bot.sendMessage(
            chatId,
            `✅ Foydalanuvchi qo'shildi!\n\n\n🆔 ID: <code>${newUser.id}</code>\n\n👤 Ism: ${newUser.name}\n\n📞 Tel: ${newUser.phone}`,
            {parse_mode: 'HTML',}
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
            const query = await getUserOnce(inputId);
            await safeDeleteMessage(bot, chatId, loadingMsg.message_id);

            if (query.empty) {
                await bot.sendMessage(chatId, '❌ Bunday ID bilan foydalanuvchi topilmadi.');
            } else {
                const user = query.docs[0].data();
                await bot.sendMessage(chatId,
                    `🔎 Foydalanuvchi Topildi:\n\n\n🆔 ID: <code>${user.id}</code>\n\n👤 Ism: ${user.name}\n\n📞 Tel: ${user.phone}`,
                    {parse_mode: 'HTML'}
                );
            }
        } catch (error) {
            await safeDeleteMessage(bot, chatId, loadingMsg.message_id);
            await bot.sendMessage(chatId, '❌ Foydalanuvchini qidirishda xatolik yuz berdi.');
        }

        clearSession(chatId);
    }

};
