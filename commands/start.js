exports.handleStart = (bot, msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Komanda tanglang:', {
        reply_markup: {
            keyboard: [['/yangiKlient', '/klientniTopish', '/barchaKlientlar']],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    });
};
