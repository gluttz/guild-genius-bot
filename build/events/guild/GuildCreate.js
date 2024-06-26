"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Event_1 = __importDefault(require("../../base/classes/Event"));
class GuildCreate extends Event_1.default {
    constructor(client) {
        super(client, {
            name: discord_js_1.Events.GuildCreate,
            description: "Guild join event",
            once: false,
        });
    }
    Execute(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data: currentGuild } = yield this.client.supabase
                    .from("guilds")
                    .select()
                    .eq("discord_server_id", +guild.id)
                    .limit(1)
                    .maybeSingle();
                if (!currentGuild) {
                    yield this.client.supabase
                        .from("guilds")
                        .insert([
                        {
                            discord_server_id: +guild.id,
                            name: guild.name,
                            icon: guild.iconURL() || null,
                            owner_id: +guild.ownerId,
                            region: guild.preferredLocale,
                        },
                    ])
                        .select();
                }
                else {
                    yield this.client.supabase
                        .from("guilds")
                        .update({
                        name: guild.name,
                        icon: guild.iconURL() || null,
                        owner_id: +guild.ownerId,
                        region: guild.preferredLocale,
                    })
                        .eq("id", currentGuild.id);
                }
                //OLD: MongoDB
                // if (!(await GuildConfig.exists({ guildId: guild.id })))
                //     await GuildConfig.create({ guildId: guild.id });
            }
            catch (err) {
                console.log(err);
            }
            const owner = yield guild.fetchOwner();
            owner === null || owner === void 0 ? void 0 : owner.send({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor("Green")
                        .setDescription("Hey! Thanks for adding me to your server! 🎉"),
                ],
            }).catch();
        });
    }
}
exports.default = GuildCreate;
