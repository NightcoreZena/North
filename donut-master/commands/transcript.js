const db = require('quick.db')
const Discord = require('discord.js')


module.exports.run = async (client, message, args) => {

    const tickets = new db.table('ticket')
    const regex = /(ticket-[0-9]+)/g.test(message.channel.name)


    if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) return message.channel.send(`I don't have permissions to create channels.`)
    if (tickets.get(`guild_${message.guild.id}_member_${message.author.id}`) === true) return message.channel.send(`You have already an ticket.`)
    await tickets.add(`guild_${message.guild.id}`, 1)
    tickets.set(`guild_${message.guild.id}_member_${message.author.id}`, true)
    message.guild.channels.create(`ticket-${tickets.get(`guild_${message.guild.id}`)}`, {
        type: 'text',
        permissionOverwrites: [
            {
                allow: 'VIEW_CHANNEL',
                id: message.author.id
            },
            {
                deny: 'VIEW_CHANNEL',
                id: message.guild.id
            },
            {
                allow: 'VIEW_CHANNEL',
                id: message.guild.roles.cache.find(role => role.name === "Support Team").id

            }
        ]
    })
}

module.exports.help = {
    name: "ticket"
}