import {
    ApplicationCommandOptionType,
    AttachmentBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import { profileImage } from "discord-arts";

export default class Profile extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "profile",
            description: "View your profile or someone else's profile.",
            category: Category.Utilities,
            default_member_permissions:
                PermissionsBitField.Flags.UseApplicationCommands,
            dm_permission: false,
            cooldown: 3,
            dev: false,
            options: [
                {
                    name: "target",
                    description: "The user to view the profile of.",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
            ],
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        const target = (interaction.options.getMember("target") ||
            interaction.member) as GuildMember;

        await interaction.deferReply({ ephemeral: true });

        const buffer = await profileImage(target.id, {
            borderColor: ["#841821", "#005b58"],
            badgesFrame: true,
            removeAvatarFrame: false,
            presenceStatus: target.presence?.status,
        });

        const attachment = new AttachmentBuilder(buffer).setName(
            `${target.user.username}_profile.png`
        );

        const color = (await target.user.fetch()).accentColor;

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(color ?? "Green")
                    .setDescription(`Profile of ${target}`)
                    .setImage(
                        `attachment://${target.user.username}_profile.png`
                    ),
            ],
            files: [attachment],
        });
    }
}
