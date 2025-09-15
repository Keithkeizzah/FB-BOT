const fs = require('fs-extra');
const path = require('path');


if (fs.existsSync('set.env')) {
    require('dotenv').config({ path: __dirname + '/set.env' });
}

let appStateValue = process.env.APPSTATE || '';
try {
    appStateValue = JSON.parse(appStateValue);
} catch (e) {
    console.error('❌ Error parsing APPSTATE. It must be a valid JSON string.');
    appStateValue = [];
}

module.exports = {
    appstate: appStateValue,
    prefix: process.env.PREFIX || '.',
    ownerName: process.env.OWNER_NAME || 'Keith',
    ownerID: process.env.OWNER_ID || '254748387615',
    botname: process.env.BOTNAME || 'KEITH-MD',
    url: process.env.URL || 'https://files.catbox.moe/mikdi0.jpg',
    gurl: process.env.GURL || 'https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47',
    forceLogin: process.env.FORCE_LOGIN === 'true',
    listenEvents: process.env.LISTEN_EVENTS !== 'false', // Defaults to true
    autoMarkRead: process.env.AUTOREAD === 'true',
    updatePresence: process.env.UPDATE_PRESENCE === 'true',
    autoMarkDelivery: process.env.AUTO_MARK_DELIVERY === 'true',    
    timezone: process.env.TIMEZONE || 'Africa/Nairobi'
};
