import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class BanRemove extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "ban.remove",
        });
        console.log("Ban Remove command loaded!");
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        const target = interaction.options.getString("target");

        const reason =
            interaction.options.getString("reason") || "No reason provided.";

        const silent = interaction.options.getBoolean("silent") || false;

        const errorEmbed = new EmbedBuilder().setColor("Red");

        if (reason.length > 512)
            return interaction.reply({
                embeds: [
                    errorEmbed.setDescription(
                        "❌ The reason cannot be longer than 512 characters!"
                    ),
                ],
                ephemeral: true,
            });

        try {
            await interaction.guild?.bans.fetch(target!);
        } catch (err) {
            return interaction.reply({
                embeds: [
                    errorEmbed.setDescription("❌ This user is not banned!"),
                ],
                ephemeral: true,
            });
        }

        try {
            await interaction.guild?.bans.remove(target!);
        } catch (err) {
            return interaction.reply({
                embeds: [
                    errorEmbed.setDescription(
                        "❌ An error occured while trying to remove the ban for this user!"
                    ),
                ],
                ephemeral: true,
            });
        }

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setDescription(`🔨 Unbanned ${target}`),
            ],
            ephemeral: true,
        });

        if (!silent)
            interaction.channel
                ?.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Green")
                            .setAuthor({
                                name: `🔨 Unban | ${target}`,
                            })
                            .setDescription(`**Reason:** \`${reason}\``),
                    ],
                })
                .then(async (msg) => await msg.react("🔨"));

        const guild = await GuildConfig.findOne({
            guildId: interaction.guildId,
        });

        if (
            guild &&
            guild.logs?.moderation?.enabled &&
            guild.logs?.moderation.channelId
        )
            (
                (await interaction.guild?.channels.fetch(
                    guild.logs?.moderation.channelId
                )) as TextChannel
            )?.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setAuthor({ name: `🔨 Unban` })
                        .setDescription(
                            `**User** | ${target}
                             **Reason:** \`${reason}\`
                            `
                        )
                        .setTimestamp()
                        .setFooter({
                            text: `Moderator | ${interaction.user.tag} - ${interaction.user.id}`,
                            iconURL: interaction.user.displayAvatarURL({}),
                        }),
                ],
            });
    }
}
