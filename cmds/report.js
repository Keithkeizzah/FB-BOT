const config = require("../config.json");

module.exports = {
    name: "report",
    usePrefix: false,
    description: "Send a message to the bot owner.",
    usage: "report <your message>",
    version: "1.1",
    admin: false,
    cooldown: false,

    async execute({ api, event, args }) {
        const senderID = event.senderID;
        const threadID = event.threadID;

        const ownerID = config.ownerID || "100030880666720";
        const message = args.join(" ");
        if (!message) return api.sendMessage("❌ Please provide a message to send.", threadID);

        // Get sender info
        const senderInfo = await api.getUserInfo(senderID);
        const senderName = senderInfo[senderID]?.name || "Unknown";

        const fullMessage = `📥 𝗥𝗲𝗽𝗼𝗿𝘁 𝗙𝗿𝗼𝗺 𝗨𝘀𝗲𝗿\n━━━━━━━━━━━━━━\n👤 Name: ${senderName}\n🆔 UID: ${senderID}\n📝 Message: ${message}`;

        try {
            await api.sendMessage(fullMessage, ownerID);
            return api.sendMessage("✅ Your message has been sent to the owner.", threadID);
        } catch (err) {
            console.error("❌ Error sending message to owner:", err);
            return api.sendMessage("❌ Failed to send your message. Try again later.", threadID);
        }
    },
};
