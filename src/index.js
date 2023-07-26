const TelegramApi = require("node-telegram-bot-api");
const puppeteer = require("puppeteer");

const dotenv = require("dotenv");
dotenv.config();

const TOKEN = process.env.TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const URL1 = process.env.URL1;
const URL2 = process.env.URL2;
const IDENT = process.env.IDENT;
const TEXT = process.env.TEXT;

const bot = new TelegramApi(TOKEN, {polling: true});

const parsfunc = async (url) => {
    const browser = await puppeteer.launch({
                executablePath: '/usr/bin/chromium-browser',
                ignoreDefaultArgs: ['--disable-extensions']
        });//{
        //headless: true,
        //args: ["--no-sandbox", "--disable-setuid-sandbox"]    
    //});
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('iframe');
    const iframeElement = await page.$('iframe');
    const frame = await iframeElement.contentFrame();
    const pars = await frame.waitForSelector(IDENT);
    const dataT = await pars.evaluate(el => el.innerText);
    await browser.close();
    if(dataT !== TEXT){
        return true;
    }
    else return false;

}

const start = () => {
    const MIN_TIME = 30;
    const MAX_TIME = 60;
    bot.on('message', async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;
        console.log(msg);
        let flag1 = true;
        let flag2 = true;
        if(text === "/start"){
            await bot.sendMessage(CHAT_ID, `Bot started`);
            const check_change = async () => {
                let rand = Math.floor(Math.random() * (MAX_TIME - MIN_TIME + 1) + MIN_TIME);
                //await bot.sendMessage(chatId, `Timeoute = ${rand}s`);
                const dataPars1 = await parsfunc(URL1);
                if(dataPars1 && flag1){
                    await bot.sendMessage(chatId, `Запись по ссылке ${URL1} открылась`);
                    await bot.sendMessage(CHAT_ID, `Запись по ссылке ${URL1} открылась`);
                    return flag1 = false;
                }
                if(!dataPars1 && !flag1){
                    await bot.sendMessage(chatId, `Запись по ссылке ${URL1} закрылась`);
                    await bot.sendMessage(CHAT_ID, `Запись по ссылке ${URL1} закрылась`);
                    return flag1 = true;
                }

                const dataPars2 = await parsfunc(URL2);
                if(dataPars2 && flag2){
                    await bot.sendMessage(chatId, `Запись по ссылке ${URL2} открылась`);
                    await bot.sendMessage(CHAT_ID, `Запись по ссылке ${URL2} открылась`);
                    return flag2 = false;
                }
                if(!dataPars2 && !flag2){
                    await bot.sendMessage(chatId, `Запись по ссылке ${URL2} закрылась`);
                    await bot.sendMessage(CHAT_ID, `Запись по ссылке ${URL2} закрылась`);
                    return flag2 = true;
                }
                setTimeout(check_change, rand * 1000);
            }
            check_change();
        }
    });
}
start();

