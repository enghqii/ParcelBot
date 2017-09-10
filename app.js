const TelegramBot = require('node-telegram-bot-api');
const request = require('request-promise');

const config = require('./config');

// Sweet tracker (택배 정보) API
class TrackerAPI {

    static GetTrackerBaseURL() {
        return 'http://info.sweettracker.co.kr';
    }

    static CreateQueryParcelPromise(companyCode, invoiceNumber) {

        var qs = {
            t_key: config.trackerAPIKey,
            t_code: companyCode,
            t_invoice: invoiceNumber,
        };

        var options = {
            url: TrackerAPI.GetTrackerBaseURL() + '/api/v1/trackingInfo',
            qs: qs,
            json: true, // Enable automatic json parse
        }

        return request(options);
    }
}

// Create a bot that uses 'polling' to fetch new updates (rather than Webhook)
const bot = new TelegramBot(config.telegramToken, { polling: true });

bot.onText(/\/start/, (msg, match) => {

    const chatID = msg.chat.id;
    var words = "Hello, " + msg.from.first_name + ". I'm your parcel bot.";

    bot.sendMessage(chatID, words);
});

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
        })
        .catch(err => {
            console.log("Something went wrong. \n " + err)
        });
});

bot.on('Message', (msg) => {
    console.log(msg);
});