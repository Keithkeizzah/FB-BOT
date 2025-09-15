const axios = require("axios");

module.exports = {
    name: "ai2",
    usePrefix: false,
    usage: "ai2 <your question> | <reply to an image> \n Powered by Gemini 2.5 pro + vision.",
    version: "1.2",
    admin: false,
    cooldown: 15,	

    execute: async ({ api, event, args }) => {
        try {
            const { threadID } = event;
            let prompt = args.join(" ");
            let imageUrl = null;
            let apiUrl = `https://autobot.mark-projects.site/api/gemini-2.5-pro-vison?ask=${encodeURIComponent(prompt)}`;

            if (event.messageReply && event.messageReply.attachments.length > 0) {
                const attachment = event.messageReply.attachments[0];
                if (attachment.type === "photo") {
                    imageUrl = attachment.url;
                    apiUrl += `&imagurl=${encodeURIComponent(imageUrl)}`;
                }
            }

            const loadingMsg = await api.sendMessage("🧠 Gemini is thinking...", threadID);

            const response = await axios.get(apiUrl);
            const description = response?.data?.data?.description;

            if (description) {
                return api.sendMessage(`🤖 **Gemini**\n━━━━━━━━━━━━━━━━\n${description}\n━━━━━━━━━━━━━━━━`, threadID, loadingMsg.messageID);
            }

            return api.sendMessage("⚠️ No description found in response.", threadID, loadingMsg.messageID);
        } catch (error) {
            console.error("❌ Gemini Error:", error);
            return api.sendMessage("❌ Error while contacting Gemini API.", event.threadID);
        }
    }
};
