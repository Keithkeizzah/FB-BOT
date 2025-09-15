const fs = require('fs-extra');
const path = require('path');

if (fs.existsSync('set.env')) {
    require('dotenv').config({ path: __dirname + '/set.env' });
}

const appstate = process.env.APPSTATE || ``;
const prefix = process.env.PREFIX || '.';
const ownerName = process.env.OWNER_NAME || 'Keith';
const forceLogin = process.env.FORCE_LOGIN || 'true';
const ownerID = process.env.OWNER_ID || '254748387615';
const listenEvents = process.env.LISTEN_EVENTS || 'true';
const botname = process.env.BOTNAME || 'KEITH-MD';
const autoMarkRead = process.env.AUTOREAD || 'true';
const url = process.env.URL || 'https://files.catbox.moe/mikdi0.jpg';
const gurl = process.env.GURL || 'https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47';
const timezone = process.env.TIMEZONE || 'Africa/Nairobi';
const updatePresence = process.env.UPDATE_PRESENCE || 'true';
const autoMarkDelivery = process.env.MEGA_PASSWORD || '';

module.exports = {
  appstate,
  prefix,
  ownerName,
  forceLogin,
  ownerID,
  listenEvents,
  botname,
  autoMarkRead,
  url,
  gurl,
  timezone,
  updatePresence,
  autoMarkDelivery
};
