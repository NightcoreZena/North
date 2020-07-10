const { MessageEmbed } = require('discord.js')


module.exports.run = async (client, message, args) => {

    var embed = new MessageEmbed()
    .setTitle(`Help Menu`)
    .setDescription(":heavy_check_mark: ?help Global | Global Commands.\n:musical_note: ?help Music | Music Commands.\n:tools: ?Help Moderation | Moderator Commands.\n:information_source: ?Help Info | Info commands")

message.channel.send(embed).then(msg => {

    msg.react("🔺")
    msg.react("🔻")
})



}

module.exports.help = {
    name: "help"
 }