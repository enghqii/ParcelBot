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
    var message = `Hello, ${msg.from.first_name}. I'm your parcel bot.\n`;
    message += "To see the command list, run /help."

    bot.sendMessage(chatID, message);
});

//
// Help
//
bot.onText(/\/help/, (msg, match) => {

    const chatID = msg.chat.id;
    var message = "<b>Command list</b>\n";
    message += "/c\nLists all company codes.\n";
    message += "/g [invoice]\nGuesses the company code by invoice number.\n";
    message += "/q [company code] [invoice]\nQueries parcel info by company code and invoice number.\n";

    bot.sendMessage(chatID, message, { parse_mode: "html" });
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

            return message;
        })
        .then(message => {
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

            return message;
        })
        .then(message => {
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

            // message header
            message += `<b>Invoice: ${resp.invoiceNo}</b>\n`;
            message += `From: ${resp.senderName}\n`;
            message += `To: ${resp.receiverName}, ${resp.receiverAddr}\n`;
            message += `Item: ${resp.itemName}\n`;
            message += `Status: ${resp.complete ? "completed" : "in transit"}\n`;
            message += '\n';

            // append details
            resp.trackingDetails
                .sort((d1, d2) => d1.time - d2.time)
                .map((detail) => {
                    return `[${detail.timeString}] ${detail.where}, ${detail.kind}`;
                }).forEach(str => {
                    message += (str + '\n');
                });

            return message;
        })
        .then(message => {
            bot.sendMessage(chatID, message, { parse_mode: "html" });
        });
});

// Useless
bot.on('Message', (msg) => {
    console.log(msg);
})
