const { setSession } = require('../sessions/sessionManager');

exports.handleNewClient = (bot, msg) => {
    const chatId = msg.chat.id;
    setSession(chatId, { step: 'ask_name' });
    bot.sendMessage(chatId, 'Ism, familiya kiriting:');
};
