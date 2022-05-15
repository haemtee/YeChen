const cheerio = require('cheerio');
const trAPI = require('@vitalets/google-translate-api');
const axios = require('axios');
const fs = require('fs');

Number.prototype.padLeft = function (base, chr) {
    var len = (String(base || 10).length - String(this).length) + 1;
    return len > 0 ? new Array(len).join(chr || '0') + this : this;
}

function logger(text) {
    const d = new Date,
        dformat = [d.getDate().padLeft(),(d.getMonth() + 1).padLeft(),  d.getFullYear()].join('/') + ' ' +
                  [d.getHours().padLeft(), d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(':');
    return console.log(`[${dformat}] ${text}`)
}

async function translate(text) {
    let text2;
    try {
        text2 = await trAPI(text, { from: 'en', to: "id", autoCorrect: true }).text;
    } catch (e) {
       logger("Failed to translate")
    } finally {
        return text2;
    }
}

async function getYechen(url) {
    const response = await axios.get(url).then(res => res.data).catch(err => { console.log(err); return false });
    if (!response) {
        return false;
    }
    const $ = cheerio.load(response);
    const title = $(".entry-title").text();
    const text = $('div.entry-content').find('p').toArray().map(p => $(p).text()).join("\n");

    logger(title);
    logger(text);
    return { title, text };
    // translate(text, "id").then(res => console.log(res));
}

async function checkNewYechen() {

    const link = await readLinkFromFile();
    // console.log({ link });
    const response = await axios.get(link).then(res => res.data).catch(err => false);
    if (!response) {
        return false;
    }
    const $ = cheerio.load(response);
    // console.log({ response });
    const newLink = $('div.nav-next').find('a').attr('href')
    logger("New Link ="+ newLink);
    if (newLink) {
        await writeLinkToFile(newLink);
        return newLink;
    }
}

async function writeLinkToFile(text) {
    fs.writeFile('yechen.txt', text, function (err) {
        if (err) return console.log(err);
        logger(text + '>yechen.txt');
    })
}

async function readLinkFromFile() {
    let read
    try {
        read = fs.readFileSync('yechen.txt')
       logger(read.toString());
    } catch (err) {
        console.err
    } finally {
        return read.toString()
    }
    //     if (err) { console.log(err); return false; }
    //     console.log("Read :", data.toString());
    //     return data.toString();
    // return read
    // })
}

// readLinkFromFile()
// getYechen(url).then(async res => {
//     if (!res?.title) return console.log('Failed to get title');
//     const text = await trAPI(res.text, { from: 'en', to: "id", autoCorrect: true })
//     console.log(text);

// })

// checkNewYechen("https://avnovel.com/amazing-son-in-law-chen-chapter-4344/")

module.exports = { getYechen, checkNewYechen, logger };