const Discord = require('discord.js')
const { parse } = require('twemoji-parser')

module.exports.run = async (client, message, args) => {

   const emoji = args[0];
   if (!emoji) return message.channel.send("No emoji provided!");

   let custom = Discord.Util.parseEmoji(emoji);

   if (custom.id) {
      const embed = new Discord.MessageEmbed()
         .setTitle(`Enlarged ${emoji}`)
         .setColor("BLUE")
         .setImage(`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif" : "png"}`);
      return message.channel.send(embed);
   } else {
      let parsed = parse(emoji, { assetType: "png" });
      if (!parsed[0]) return message.channel.send("Invalid emoji!");
      const embed = new Discord.MessageEmbed()
         .setTitle(`Enlarged ${emoji}`)
         .setColor("BLUE")
         .setImage(parsed[0].url);
      return message.channel.send(embed);
   }
}

module.exports.help = {
   name: "enlarge"
}