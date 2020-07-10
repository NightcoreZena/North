const Discord = require('discord.js');
const Canvas = require('canvas')
const colors = require('../colors.json')
const db = require('quick.db')

module.exports.run = async (client, message, args) => {

    let user = message.mentions.users.first() || message.author
    let money = db.fetch(`money_${user.id}`)
    
    if(money === null) money = 0

    
    const canvas = Canvas.createCanvas(500, 200);
    const ctx = canvas.getContext('2d')

    const background = await Canvas.loadImage("https://media.discordapp.net/attachments/730658165913550947/730861120864256020/61bbd70ab45c33e6455d097adc29db7a.png")
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#FFFFFF'
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "#FFFFFF"
    var size1 = 40;
    var size3 = 30;

    var name = client.users.cache.get(user.id).tag
    do {
        ctx.font = `${size1 -= 5}px sans-serif`;
    } while (ctx.measureText(name).width > canvas.width - 225)
    ctx.fillText(name, 200, 65)

    do {
        ctx.font = `${size3 -= 5}px sans-serif`;
    } while (ctx.measureText(`You have $${money}`).width > canvas.width - 225)
    ctx.fillText(`You have $${money}`,  200, 120)


    ctx.beginPath();
    ctx.arc(100, 100, 75, 0, Math.PI * 2, true)
    ctx.closePath();
    ctx.clip();

    const avatar = await Canvas.loadImage(user.displayAvatarURL({format: "jpg"}))
    ctx.drawImage(avatar, 25, 25, 150, 150,)

    const final = new Discord.MessageAttachment(canvas.toBuffer(), "bal.png")

    return message.channel.send(final)

    
}

module.exports.help = {
    name: "bal"
    
}