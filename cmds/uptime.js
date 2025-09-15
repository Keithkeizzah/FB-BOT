const axios = require("axios");
const fs = require("fs");
const path = require("path");

const startTime = Date.now(); // Save this at the top level for global uptime

module.exports = {
    name: "uptime",
    usePrefix: false,
    usage: "uptime",
    description: "Get the bot uptime image",
    version: "1.1",
    admin: false,
    cooldown: 5,

    async execute({ api, event }) {
        try {
            // Calculate uptime
            const uptimeMs = Date.now() - startTime;
            const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
            const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
            const seconds = Math.floor((uptimeMs / 1000) % 60);

            const imgUrl = `https://kaiz-apis.gleeze.com/api/uptime?instag=brtbrtbrt15&ghub=Jhon-mark23&fb=Mark Martinez&hours=${hours}&minutes=${minutes}&seconds=${seconds}&botname=Fbot-V1.8`;
            const filePath = path.join(__dirname, "cache", `uptime_${event.senderID}.png`);

            const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(filePath, res.data);

            api.sendMessage({
                body: "Fbot-V1.8 uptime",
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));
        } catch (error) {
            console.error("Uptime error:", error);
            api.sendMessage("Failed to fetch uptime image.", event.threadID, event.messageID);
        }
    }
};
