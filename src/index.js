const TelegramApi = require("node-telegram-bot-api");
const puppeteer = require("puppeteer");

const dotenv = require("dotenv");
dotenv.config();

const TOKEN = process.env.TOKEN;
const URL1 = process.env.URL1;
const URL2 = process.env.URL2;
const IDENT = process.env.IDENT;
const TEXT = process.env.TEXT;

const bot = new TelegramApi(TOKEN, {polling: true});

const parsfunc = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('iframe');
    const iframeElement = await page.$('iframe');
    const frame = await iframeElement.contentFrame();
    const pars = await frame.waitForSelector(IDENT);
    const dataT = await pars.evaluate(el => el.innerText);
    await browser.close();
    if(dataT === TEXT){
        return false;
    }
    else return true;

}

bot.on('message', (msg) => {
	const text = msg.text;
	const chatId = msg.chat.id;
	console.log(msg);
	if(text === "/start"){ 
        let flag1 = true;
        let flag2 = true;
        const start = async () => {
            const dataPars1 = await parsfunc(URL1);
            if(dataPars1 && flag1){
                bot.sendMessage(chatId, `Запись по ссылке ${URL1} открылась`);
                flag1 = false;
            }
            if(!dataPars1 && !flag1){
                bot.sendMessage(chatId, `Запись по ссылке ${URL1} закрылась`);
                flag1 = true;
            }

            const dataPars2 = await parsfunc(URL2);
            if(dataPars2 && flag2){
                bot.sendMessage(chatId, `Запись по ссылке ${URL2} открылась`);
                flag2 = false;
            }
            if(!dataPars2 && !flag2){
                bot.sendMessage(chatId, `Запись по ссылке ${URL2} закрылась`);
                flag2 = true;
            }
        }
        
        start();
        setInterval(start, 30000);
    }
});