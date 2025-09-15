const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "removebg",
    usePrefix: false,
    usage: "removebg <reply a photo>",
    version: "1.1",
    admin: false,
    cooldown: 5,
    async execute({ api, event }) {
        const { messageReply, threadID, messageID } = event;

        if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
            return api.sendMessage("❌ Please reply to an image.", threadID, messageID);
        }

        const attachment = messageReply.attachments[0];
        if (attachment.type !== "photo") {
            return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
        }

        const imageUrl = attachment.url;
        const apiUrl = `https://kaiz-apis.gleeze.com/api/removebgv2?url=${encodeURIComponent(imageUrl)}`;

        try {
            api.sendMessage("⏳ Removing background from the image...", threadID);

            const { data } = await axios.get(apiUrl);
            if (!data || !data.response) {
                return api.sendMessage("❌ Failed to get processed image from API.", threadID);
            }

            const processedImageUrl = data.response;
            const imageRes = await axios.get(processedImageUrl, { responseType: "arraybuffer" });

            const tempDir = path.join(__dirname, "..", "temp");
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

            const tempPath = path.join(tempDir, `removedbg_${Date.now()}.png`);
            fs.writeFileSync(tempPath, Buffer.from(imageRes.data, "binary"));

            api.sendMessage(
                {
                    body: "✅ Background removed!",
                    attachment: fs.createReadStream(tempPath)
                },
                threadID,
                () => fs.unlinkSync(tempPath)
            );
        } catch (err) {
            console.error("RemoveBG Error:", err.message);
            api.sendMessage("❌ Error occurred while removing background.", threadID);
        }
    }
};
