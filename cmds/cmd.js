module.exports = {
    name: "cmd",
    usePrefix: false,
    admin: true,
    usage: "cmd",
    version: "1.0",
    description: "Show admin-only commands.",
    cooldown: 5,

    async execute({ api, event }) {
        const { threadID, messageID } = event;

        const adminCommands = Array.from(global.commands.values())
            .filter(cmd => cmd.admin === true)
            .sort((a, b) => a.name.localeCompare(b.name));

        if (adminCommands.length === 0) {
            return api.sendMessage("❌ No admin commands found.", threadID, messageID);
        }

        const formatted = adminCommands.map((cmd, i) =>
            `${i + 1}. ${cmd.name}\n   Usage: ${cmd.usage}\n   Version: ${cmd.version}`
        ).join("\n\n");

        const msg = `
╔════════════╗
   🔐 Admin Commands
╚════════════╝

${formatted}

Only accessible by bot owner.`;

        return api.sendMessage(msg, threadID, messageID);
    }
};
