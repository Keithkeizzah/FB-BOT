const fs = require("fs");
const path = require("path");
const express = require("express");
const login = require("ws3-fca");

// Load environment variables from set.js
const config = require("./set.js");

const app = express();
const PORT = 3000;

const botPrefix = config.prefix || ".";
const cooldowns = new Map();

global.events = new Map();
global.commands = new Map();

const loadEvents = () => {
    try {
        const files = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
        for (const file of files) {
            const event = require(`./events/${file}`);
            if (event.name && event.execute) {
                global.events.set(event.name, event);
                console.log(`✅ Loaded event: ${event.name}`);
            }
        }
    } catch (err) {
        console.error("❌ Error loading events:", err);
    }
};

const loadCommands = () => {
    try {
        const files = fs.readdirSync("./cmds").filter(file => file.endsWith(".js"));
        for (const file of files) {
            const cmd = require(`./cmds/${file}`);
            if (cmd.name && cmd.execute) {
                global.commands.set(cmd.name, cmd);
                console.log(`✅ Loaded command: ${cmd.name}`);
            }
        }
    } catch (err) {
        console.error("❌ Error loading commands:", err);
    }
};

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});
app.listen(PORT, () => {
    console.log(`🌐 Web Server running at http://localhost:${PORT}`);
});

const detectedURLs = new Set();

const startBot = () => {
    try {
        // Parse appState from environment variable
        let appState;
        try {
            appState = JSON.parse(config.appstate);
        } catch (e) {
            console.error("❌ Invalid APPSTATE format. It should be a valid JSON string.");
            process.exit(1);
        }

        login({ appState }, (err, api) => {
            if (err) {
                console.error("❌ Login failed:", err);
                return;
            }

            try {
                console.clear();
                
                // Set options from config
                api.setOptions({
                    listenEvents: config.listenEvents === 'true',
                    updatePresence: config.updatePresence === 'true',
                    forceLogin: config.forceLogin === 'true',
                    autoMarkRead: config.autoMarkRead === 'true',
                    autoMarkDelivery: config.autoMarkDelivery === 'true'
                });
                
                console.log("🤖 Bot is now online!");
                api.sendMessage("🤖 Bot has started successfully!", config.ownerID);

                global.events.forEach((handler) => {
                    if (handler.onStart) handler.onStart(api);
                });

                api.listenMqtt(async (err, event) => {
                    if (err) {
                        console.error("❌ Event error:", err);
                        return api.sendMessage("❌ Error while listening to events.", config.ownerID);
                    }

                    try {
                        if (global.events.has(event.type)) {
                            await global.events.get(event.type).execute({ api, event });
                        }

                        const urlRegex = /(https?:\/\/[^\s]+)/gi;
                        if (event.body && urlRegex.test(event.body)) {
                            const urlCommand = global.commands.get("url");
                            if (urlCommand) {
                                const detectedURL = event.body.match(urlRegex)[0];
                                const key = `${event.threadID}-${detectedURL}`;
                                if (detectedURLs.has(key)) return;
                                detectedURLs.add(key);

                                try {
                                    await urlCommand.execute({ api, event });
                                } catch (error) {
                                    console.error("❌ URL command failed:", error);
                                }

                                setTimeout(() => detectedURLs.delete(key), 3600000);
                            }
                        }

                        if (event.body) {
                            let args = event.body.trim().split(/ +/);
                            let commandName = args.shift().toLowerCase();
                            let command;

                            if (global.commands.has(commandName)) {
                                command = global.commands.get(commandName);
                            } else if (event.body.startsWith(botPrefix)) {
                                commandName = event.body.slice(botPrefix.length).split(/ +/).shift().toLowerCase();
                                command = global.commands.get(commandName);
                            }

                            if (command) {
                                if (command.usePrefix && !event.body.startsWith(botPrefix)) return;

                                const requiredFields = ["name", "execute", "usage", "version"];
                                const isValid = requiredFields.every(field => field in command && command[field]);
                                if (!isValid || typeof command.execute !== "function") {
                                    console.warn(`⚠️ Command '${commandName}' structure is invalid.`);
                                    return api.sendMessage(`⚠️ Command '${commandName}' is broken.`, event.threadID);
                                }

                                if (command.admin && event.senderID !== config.ownerID) {
                                    return api.sendMessage("❌ This command is restricted to the bot owner.", event.threadID);
                                }

                                const now = Date.now();
                                const cooldown = (command.cooldown || 0) * 1000;
                                const key = `${event.senderID}-${command.name}`;
                                const lastUsed = cooldowns.get(key) || 0;

                                if (now - lastUsed < cooldown) {
                                    const wait = ((cooldown - (now - lastUsed)) / 1000).toFixed(1);
                                    return api.sendMessage(`⏳ Please wait ${wait}s before using '${command.name}' again.`, event.threadID);
                                }

                                try {
                                    await command.execute({ api, event, args });
                                    cooldowns.set(key, now);
                                } catch (error) {
                                    console.error(`❌ Command '${command.name}' failed:`, error);
                                    api.sendMessage(`❌ Error while executing '${command.name}'.`, event.threadID);
                                    api.sendMessage(`❌ Error in '${command.name}':\n${error.message}`, config.ownerID);
                                }
                            }
                        }
                    } catch (eventError) {
                        console.error("❌ Error in event handler:", eventError);
                        api.sendMessage("❌ Critical error during event handling.", config.ownerID);
                    }
                });
            } catch (innerError) {
                console.error("❌ Critical bot error:", innerError);
            }
        });
    } catch (error) {
        console.error("❌ Bot crashed at launch:", error);
    }
};

process.on("unhandledRejection", (reason) => {
    console.error("⚠️ Unhandled Promise Rejection:", reason);
});
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
});

loadEvents();
loadCommands();
startBot();
