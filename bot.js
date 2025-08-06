require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { handleMessage } = require('./handlers/messageHandler');
const { handleStart } = require('./commands/start');
const { handleNewClient } = require('./commands/newClient');
const { handleGetClient } = require('./commands/getClient');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => handleStart(bot, msg));
bot.onText(/\/newClient/, (msg) => handleNewClient(bot, msg));
bot.onText(/\/getClient/, (msg) => handleGetClient(bot, msg));

bot.on('message', (msg) => handleMessage(bot, msg));
