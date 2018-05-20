import * as TelegramBot from 'node-telegram-bot-api';
import { TrackerAPI } from './TrackerAPI';

import { Config } from './config'

/**
 * 
 */
class ParcelBot extends TelegramBot {

    constructor() {

        console.log("Initializing...");

        // Create a bot that uses 'polling to fetch new updates
        super(Config.telegramToken, { polling: true });

        // register callbacks
        this.onText(/\/start/, this.Start);
        this.onText(/\/help/, this.Help);
        this.onText(/\/c/, this.ListCompanyCode);
        this.onText(/\/g (\d+)/, this.GuesssCompanyCode);
        this.onText(/\/q (.+) (.+)/, this.QueryParcelInfo);

        console.log("Done.");
    }

    /**
     * Start
     */
    private Start(msg: TelegramBot.Message, match: RegExpExecArray | null): void {

        const chatID: number = msg.chat.id;
        let message: string = `Hello, ${msg.from.first_name}. I'm your parcel bot.\n`;
        message += "To see the command list, run /help."
    
        this.sendMessage(chatID, message);
    }

    /**
     * Help
     * Print out help strings
     */
    private Help(msg: TelegramBot.Message, match: RegExpExecArray | null): void {

        const chatID: number = msg.chat.id;
        let message: string = "<b>Command list</b>\n";
        message += "/c\nLists all company codes.\n";
        message += "/g [invoice]\nGuesses the company code by invoice number.\n";
        message += "/q [company code] [invoice]\nQueries parcel info by company code and invoice number.\n";
    
        bot.sendMessage(chatID, message, { parse_mode: "html" });
    }

    /**
     * /c
     * List company codes
     */
    private ListCompanyCode(msg: TelegramBot.Message, match: RegExpExecArray | null): void {

        const chatID = msg.chat.id;

        TrackerAPI.CreateRetrieveCompanyCodeListPromise()
            .then(resp => {
                let message: string = "";
    
                resp.Company.forEach((_, index) => {
                    message += `${index}. ${_.Code} (${_.Name})\n`;
                });
    
                return message;
            })
            .then(message => {
                bot.sendMessage(chatID, message, { parse_mode: "html" });
            });
    }

    /**
     * /g [invoice]
     * Guess 
     */
    private GuesssCompanyCode(msg: TelegramBot.Message, match: RegExpExecArray | null): void {

        const chatID: number = msg.chat.id;
        let invoice: string = match[1];

        TrackerAPI.CreateGuessCompanyCodePromise(invoice)
            .then(resp => {

                let message: string = "";

                resp.Recommend.forEach((_, index) => {
                    message += `${index}. ${_.Code} (${_.Name})\n`;
                });

                return message;
            })
            .then(message => {
                bot.sendMessage(chatID, message, { parse_mode: "html" });
            });
    }

    /**
     * /q [company code] [invoice]
     * Queries parcel info by company code & invoice number.
     */
    private QueryParcelInfo(msg: TelegramBot.Message, match: RegExpExecArray | null): void {

        const chatID: number = msg.chat.id;

        TrackerAPI.CreateQueryParcelPromise(match[1], match[2])
            .then(resp => {
    
                let message = "";
    
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
    }
};

const bot: ParcelBot = new ParcelBot();
