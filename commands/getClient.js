const { setSession } = require('../sessions/sessionManager');

exports.handleGetClient = (bot, msg) => {
    const chatId = msg.chat.id;
    setSession(chatId, { step: 'get_client_id' });
    bot.sendMessage(chatId, 'Foydalanuvchining Idsini kiriting:');
};
