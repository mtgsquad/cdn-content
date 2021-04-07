import { SlashCommand } from "slash-create";
import { client } from "../index";

module.exports = class TicketCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: "ticket",
            description: "Make a new ticket",
        });

        // Not required initially, but required for reloading with a fresh file.
        this.filePath = __filename;
    }

    async run(ctx) {
        let server = ctx.guild;

        let category = server.channels.cache.find(c => c.name == "tickets" && c.type == "category")
        if(!category) {
            ctx.send('Hey, the tickets category does not exist in this discord server, Ask the admins to make one!')
        }
        
        const channel = await ctx.guild.channels.create(`ticket: ${ctx.author.tag}`);

        channel.setParent("820276801652916270");

        channel.updateOverwrite(ctx.guild.id, {
            SEND_MESSAGE: false,
            VIEW_CHANNEL: false,
        });
        channel.updateOverwrite(ctx.author, {
            SEND_MESSAGE: true,
            VIEW_CHANNEL: true,
        });

        const reactionMessage = await channel.send("Thank you for contacting support!");

        try {
            await reactionMessage.react("🔒");
            await reactionMessage.react("❌");
        } catch (err) {
            channel.send("Error sending emojis!");
            throw err;
        }

        const collector = reactionMessage.createReactionCollector(
            (reaction, user) => ctx.guild.members.cache.find((member) => member.id === user.id).hasPermission("ADMINISTRATOR"),
            { dispose: true }
        );

        collector.on("collect", (reaction, user) => {
            switch (reaction.emoji.name) {
                case "🔒":
                    channel.updateOverwrite(ctx.author, { SEND_MESSAGES: false });
                    break;
                case "❌":
                    channel.send("Deleting this channel in 5 seconds!");
                    setTimeout(() => channel.delete(), 5000);
                    break;
            }
        });

        ctx.channel
            .send(`Support Will Be Right With You, Please Look At Your Ticket: ${channel}`)
            .then((msg) => {
                setTimeout(() => msg.delete(), 7000);
                setTimeout(() => ctx.delete(), 3000);
            })
            .catch((err) => {
                throw err;
            });
    },
};
    }
};
