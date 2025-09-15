module.exports = {
    name: "id",
    usePrefix: false,
    usage: "id [@mention]",
    version: "1.0",
    description: "Fetch the Facebook User ID (UID) of a mentioned user or yourself.",
    admin: false,
    cooldown: 10,

    execute: async ({ api, event }) => {
        const { threadID, messageID, senderID, mentions } = event;
        
        let uid;
        let userName;

        // Check if a user is mentioned
        if (Object.keys(mentions).length > 0) {
            uid = Object.keys(mentions)[0]; // Get the first mentioned user's ID
            userName = mentions[uid].replace("@", ""); // Get mentioned user's name
        } else {
            uid = senderID; // If no mention, get the sender's UID
            userName = "You";
        }
        
        api.sendMessage(`🔍 Facebook UID for ${userName}: ${uid}`, threadID, messageID);
    }
};
