const { Telegraf } = require('telegraf')
const cron = require('node-cron')
const {checkNewYechen, getYechen } = require('./function.js')

require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Welcome'))

cron.schedule('*/5 * * * *', async () => {
    console.log('Running schedule checkNewYechen');
    const newLink = await checkNewYechen();
    if (newLink) {
        console.log('Hurray, new Yechen :',newLink);
        const yechen = await getYechen(newLink);
        console.log("Title :", yechen.title);
        if (yechen) {
            console.log("Send English Version");
            await bot.telegram.sendMessage(process.env.CHAT_ID, `${yechen.title}\n\n${yechen.text}`);
            // console.log("Trying translate");
            // const text = await translate(yechen.text);
            // console.log("Send translate result");
            // await bot.telegram.sendMessage(process.env.CHAT_ID, `${yechen.title}\n\n${text}`);
        }
    }
    //running every 5 min

  });

bot.launch().then(() => console.log('Bot started')).catch((err) => console.log(err))



// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))