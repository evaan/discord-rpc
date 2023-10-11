const discord = require("discord.js");
const client = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.GuildPresences] });
const fs = require("fs");
const https = require('https');
const config = require("./config.json")
const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

rpc = {};

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    setInterval(async () => {
        let guild = (await client.guilds.fetch(config.serverid));
        let user = await guild.members.fetch(config.userid);
        let activities = user.presence.activities;
        let activity;
        activities.forEach((activity1, index) => {
            if (activity1.name !== "Spotify") {
                activity = activities[index];
                return;
            }
        });
        if (activity == undefined) {
            rpc.online = false;
            return;
        }
        if (activities.length == 0) {
            rpc.online = false;
            return;
        } else rpc.online = true;
        try {
            https.get(activity.assets.largeImageURL(), (res) => {
                res.pipe(fs.createWriteStream("large.webp"));
                rpc.image = fs.readFileSync("./large.webp", "base64");;
            });
        } catch {
            rpc.image = "";
        }
        rpc.name = activity.name
        if (activity.details == null) rpc.details = "";
        else rpc.details = activity.details;
        if (activity.state == null) rpc.state = "";
        else rpc.state = activity.state;
    }, 10000);
});

app.get('/', (request, response) => {
    response.json(rpc);
});

app.listen(8181, (err) => {if (err) console.log(err);});

client.login(config.token);