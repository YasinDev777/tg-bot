const userSessions = {};

exports.getSession = (chatId) => userSessions[chatId];
exports.setSession = (chatId, data) => userSessions[chatId] = data;
exports.clearSession = (chatId) => delete userSessions[chatId];
