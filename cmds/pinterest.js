const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "pinterest",
    usePrefix: false,
    usage: "pinterest [prompt] [count]",
    version: "1.0",
    admin: false,
    cooldown: 10,

    execute: async ({ api, event, args }) => {
        const { threadID, messageID } = event;

        if (!args[0]) {
            return api.sendMessage("⚠️ Please provide a search prompt.\nUsage: pinterest [prompt] [count]", threadID, messageID);
        }

        const count = Number(args[args.length - 1]);
        const isCount = !isNaN(count) && count > 0 && count <= 10; // Added validation (1-10 images)
        const prompt = isCount ? args.slice(0, -1).join(" ") : args.join(" ");
        const imageCount = isCount ? count : 1;

        const apiUrl = `https://ccprojectapis.ddns.net/api/pin?title=${encodeURIComponent(prompt)}&count=${imageCount}`;

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            const response = await axios.get(apiUrl);
            const links = response.data?.data;

            if (!links || links.length === 0) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("⚠️ No images found.", threadID, messageID);
            }

            // Send the first image with caption
            const firstImagePath = path.join(__dirname, `pin-0.jpg`);
            const firstWriter = fs.createWriteStream(firstImagePath);
            
            const firstImageRes = await axios({ url: links[0], method: "GET", responseType: "stream" });
            firstImageRes.data.pipe(firstWriter);

            await new Promise((resolve, reject) => {
                firstWriter.on("finish", resolve);
                firstWriter.on("error", reject);
            });

            await api.sendMessage({
                body: `📌 Pinterest Results for: "${prompt}" (1/${links.length})`,
                attachment: fs.createReadStream(firstImagePath),
            }, threadID);

            fs.unlinkSync(firstImagePath);

            // Send remaining images with delay between them
            for (let i = 1; i < links.length; i++) {
                const filePath = path.join(__dirname, `pin-${i}.jpg`);
                const writer = fs.createWriteStream(filePath);

                const imageRes = await axios({ url: links[i], method: "GET", responseType: "stream" });
                imageRes.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on("finish", resolve);
                    writer.on("error", reject);
                });

                await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay between images

                await api.sendMessage({
                    body: `(${i+1}/${links.length})`,
                    attachment: fs.createReadStream(filePath),
                }, threadID);

                fs.unlinkSync(filePath);
            }

            api.setMessageReaction("✅", messageID, () => {}, true);

        } catch (error) {
            console.error("❌ Pinterest Error:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("⚠️ Failed to fetch Pinterest images.", threadID, messageID);
        }
    },
};
