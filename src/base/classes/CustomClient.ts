import { Client, Collection, GatewayIntentBits } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";
import IConfig from "../interfaces/IConfig";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import { connect } from "mongoose";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export default class CustomClient extends Client implements ICustomClient {
    config: IConfig;
    handler: Handler;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    developmentMode: boolean;
    supabase: SupabaseClient<Database>;

    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
        });

        this.config = require(`${process.cwd()}/data/config.json`);

        this.handler = new Handler(this);

        this.commands = new Collection();

        this.subCommands = new Collection();

        this.cooldowns = new Collection();

        this.developmentMode = process.argv.slice(2).includes("--development");

        this.supabase = createClient<Database>(
            this.config.supabaseUrl,
            this.config.supabaseServiceRoleKey
        );
    }

    Init(): void {
        console.log(
            `Starting the bot in ${
                this.developmentMode ? "development" : "production"
            } mode...`
        );

        this.LoadHandlers();

        this.login(
            this.developmentMode ? this.config.devToken : this.config.token
        ).catch((err) => console.error(err));

        //OLD: MongoDB
        // connect(
        //     this.developmentMode
        //         ? this.config.devMongoUrl
        //         : this.config.mongoUrl
        // )
        //     .then(() => console.log("Connected to MongoDB!"))
        //     .catch((err) => console.log(err));
    }

    LoadHandlers(): void {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    }
}
