const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "spotify",
    usePrefix: false,
    usage: "spotify [song name]",
    description: "Search and download Spotify track.",
    version: "1.0",
    cooldown: 5,

    async execute({ api, event, args }) {
        if (!args[0]) {
            return api.sendMessage("Please provide a search keyword.\nUsage: spotify [song name]", event.threadID, event.messageID);
        }

        const keyword = encodeURIComponent(args.join(" "));
        const searchURL = `https://kaiz-apis.gleeze.com/api/spotify-search?q=${keyword}`;

        try {
            const searchRes = await axios.get(searchURL);
            const track = searchRes.data[0]; // Get the first result

            if (!track || !track.trackUrl) {
                return api.sendMessage("No track found.", event.threadID, event.messageID);
            }

            const downloadURL = `https://kaiz-apis.gleeze.com/api/spotify-down?url=${encodeURIComponent(track.trackUrl)}`;
            const dlRes = await axios.get(downloadURL);
            const { title, url, artist, thumbnail } = dlRes.data;

            // Download thumbnail
            const imgPath = path.join(__dirname, "cache", `thumb_${event.senderID}.jpg`);
            const audioPath = path.join(__dirname, "cache", `audio_${event.senderID}.mp3`);
            const imgRes = await axios.get(thumbnail, { responseType: "arraybuffer" });
            fs.writeFileSync(imgPath, imgRes.data);

            // Download audio
            const audioRes = await axios.get(url, { responseType: "arraybuffer" });
            fs.writeFileSync(audioPath, audioRes.data);

            // Send thumbnail and caption
            api.sendMessage({
                body: `🎵 Title: ${title}\n👤 Artist: ${artist}`,
                attachment: fs.createReadStream(imgPath)
            }, event.threadID, () => {
                // Send audio after image
                api.sendMessage({
                    body: "🎧 Here’s your Spotify track!",
                    attachment: fs.createReadStream(audioPath)
                }, event.threadID, () => {
                    fs.unlinkSync(imgPath);
                    fs.unlinkSync(audioPath);
                });
            });

        } catch (err) {
            console.error("Spotify Error:", err);
            api.sendMessage("An error occurred while processing your request.", event.threadID, event.messageID);
        }
    }
};
