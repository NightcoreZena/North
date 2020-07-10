const Discord = require('discord.js')

module.exports.run = async (client, message, args) => {

    var mentionuser = message.mentions.members.first() || message.author

    mentionuser = mentionuser.user || message.author


    const Discord = require('discord.js')
    const Canvas = require('canvas');
    const canvas = Canvas.createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
  
    ctx.beginPath()
    ctx.lineWidth = 10
    ctx.arc(100, 100, 90, 0, Math.PI * 2)
    ctx.clip()
    ctx.stroke()
  
    let IMG = await Canvas.loadImage(mentionuser.displayAvatarURL({size: 512, format: 'png'}))
  
    ctx.drawImage(IMG,  0, 0, 200, 200) 
  
    const attach = new Discord.MessageAttachment(canvas.toBuffer(), 'avatar.png');
    message.channel.send(`${mentionuser.tag} Avatar.`, attach)

  }



module.exports.help = {
    name: "avatar"
}