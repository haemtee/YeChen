const { Telegraf } = require('telegraf')
const cron = require('node-cron')
const {checkNewYechen, getYechen, logger } = require('./function.js')

require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Welcome'))

bot.command('id', (ctx)=> {
    ctx.reply(`Your id :\`${ctx.from.id}\``)
} )

cron.schedule('*/5 * * * *', async () => {
    logger('Running schedule checkNewYechen');
    const newLink = await checkNewYechen();
    if (newLink) {
        logger('Hurray, new Yechen :',newLink);
        const yechen = await getYechen(newLink);
        logger("Title :", yechen.title);
        if (yechen) {
            logger("Send English Version");
            return await bot.telegram.sendMessage(process.env.CHAT_ID, `${yechen.title}\n\n${yechen.text}`);
            // logger("Trying translate");
            // const text = await translate(yechen.text);
            // logger("Send translate result");
            // await bot.telegram.sendMessage(process.env.CHAT_ID, `${yechen.title}\n\n${text}`);
        }
    }
    logger("too bad no new Yechen Chapter");

  });

bot.launch().then(() => logger('Bot started')).catch((err) => logger(err))

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))