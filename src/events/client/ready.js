module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log("\x1b[32m", `${client.user.tag} online !`, '\x1b[0m');
    }
};