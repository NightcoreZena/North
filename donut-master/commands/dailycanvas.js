const ms = require('parse-ms');
const db = require('quick.db');
const Canvas = require('canvas')
const Discord = require('discord.js')

let timeout = 86400000
let amount = Math.floor(Math.random() * 300)

module.exports.run = async (client, message, args) => {
    let daily = await db.fetch(`daily_${message.author.id}`);

    if (daily != null && timeout - (Date.now() - daily) > 0) {
        let time = ms(timeout - (Date.now() - daily));
        message.channel.send(`You already claimed your daily reward today. come back in **${time.hours}**h, **${time.minutes}**m, **${time.seconds}**s`)
    } else {

        const canvas = Canvas.createCanvas(500, 200);
        const ctx = canvas.getContext('2d')
    
        const background = await Canvas.loadImage("https://media.discordapp.net/attachments/730658165913550947/730861120864256020/61bbd70ab45c33e6455d097adc29db7a.png")
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    
        ctx.strokeStyle = '#FFFFFF'
        ctx.strokeRect(0, 0, canvas.width, canvas.height)
    
        ctx.fillStyle = "#FFFFFF"
        var size1 = 40;
        var size3 = 30;
    
        do {
            ctx.font = `${size1 -= 5}px sans-serif`;
        } while (ctx.measureText("Daily Rewards").width > canvas.width - 225)
        ctx.fillText("Daily Rewards", 200, 65)
    
        do {
            ctx.font = `${size3 -= 5}px sans-serif`;
        } while (ctx.measureText(`You collected $${amount}`).width > canvas.width - 225)
        ctx.fillText(`You collected $${amount}`,  200, 120)
    
    
        ctx.beginPath();
        ctx.arc(100, 100, 75, 0, Math.PI * 2, true)
        ctx.closePath();
        ctx.clip();
    
        const avatar = await Canvas.loadImage(message.author.displayAvatarURL({format: "jpg"}))
        ctx.drawImage(avatar, 25, 25, 150, 150,)
    
        const final = new Discord.MessageAttachment(canvas.toBuffer(), "daily.png")
    

        message.channel.send(final)

        db.add(`money_${message.author.id}`, amount)
        db.add(`daily_${message.author.id}`, Date.now())
    }
}

module.exports.help = {
    name: "daily"
}