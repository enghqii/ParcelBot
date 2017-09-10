const TelegramBot = require('node-telegram-bot-api');

const config     = require('./config');
const TrackerAPI = require('./TrackerAPI');

// Create a bot that uses 'polling' to fetch new updates (rather than Webhook)
const bot = new TelegramBot(config.telegramToken, { polling: true });

//
// Start
//
bot.onText(/\/start/, (msg, match) => {

    const chatID = msg.chat.id;
    var words = "Hello, " + msg.from.first_name + ". I'm your parcel bot.";

    bot.sendMessage(chatID, words);
});

//
// /c
// Lists all company codes.
//
bot.onText(/\/c/, (msg, match) => {

    const chatID = msg.chat.id;
    var invoice = match[1];

    TrackerAPI.CreateRetrieveCompanyCodeListPromise()
        .then(resp => {

            var message = "";

            resp.Company.forEach((_, index) => {
                message += `${index}. ${_.Code} (${_.Name})\n`;
            });

            bot.sendMessage(chatID, message, { parse_mode: "html" });
        });
});

//
// /g [invoice]
// Guesses the company code by invoice number.
//
bot.onText(/\/g (\d+)/, (msg, match) => {

    const chatID = msg.chat.id;
    var invoice = match[1];

    TrackerAPI.CreateGuessCompanyCodePromise(invoice)
        .then(resp => {

            var message = "";

            resp.Recommend.forEach((_, index) => {
                message += `${index}. ${_.Code} (${_.Name})\n`;
            });

            bot.sendMessage(chatID, message, { parse_mode: "html" });
        });
});

//
// /q [company code] [invoice]
// Queries parcel info by company code and invoice number.
//
bot.onText(/\/q (.+) (.+)/, (msg, match) => {

    const chatID = msg.chat.id;

    TrackerAPI.CreateQueryParcelPromise(match[1], match[2])
        .then(resp => {

            var message = "";

            message += `<b>Invoice: ${resp.invoiceNo}</b>\n`;
            message += `From: ${resp.senderName}\n`;
            message += `To: ${resp.receiverName}, ${resp.receiverAddr}\n`;
            message += `Item: ${resp.itemName}\n`;
            message += '\n';

            resp.trackingDetails
                .sort((d1, d2) => d1.time - d2.time)
                .map((detail) => {
                    return `[${detail.timeString}] ${detail.where}, ${detail.kind}`;
                }).forEach(str => {
                    message += (str + '\n');
                });

            bot.sendMessage(chatID, message, { parse_mode: "html" });
        });
});

// Useless
bot.on('Message', (msg) => {
    console.log(msg);
})
