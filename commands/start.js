exports.handleStart = (bot, msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Choose action:', {
        reply_markup: {
            keyboard: [['/newClient', '/getClient']],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    });
};
