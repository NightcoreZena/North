const db = require('quick.db')
const { Client, Util, MessageEmbed, Collection } = require('discord.js')
const ytdl = require('ytdl-core')
const YouTube = require('simple-youtube-api')
const { util } = require('simple-youtube-api')
const PREFIX = '?'
const prefix = '?'

const fs = require('fs')



const client = new Client({ disableEveryone: true })
client.commands = new Collection()


fs.readdir("./commands/", (err, files) => {

    if (err) console.log(err);

    var jsFiles = files.filter(f => f.split(".").pop() === "js");

    if (jsFiles.length <= 0) {
        console.log('No files.')
        return;
    }

    jsFiles.forEach((f, i) => {

        var commandsfileGet = require(`./commands/${f}`);
        console.log(`The file ${f} is loaded`);

        client.commands.set(commandsfileGet.help.name, commandsfileGet)


    })

});

client.on('guildMemberAdd', member => {

    var role = member.guild.roles.cache.get("730535117688406067")

    if (!role) return;

    member.roles.add(role)

})

const youtube = new YouTube(process.env.apikey)

const queue = new Map()

client.on('ready', () => console.log('Hello World.'))

client.on('message', async message => {
    if (message.author.bot) return
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);

    var messageArray = message.content.split(" ");

    var command = messageArray[0]

    var commands = client.commands.get(command.slice(prefix.length));

    var arguments = messageArray.slice(1);

    if (commands) commands.run(client, message, arguments);


    const searchString = args.slice(1).join(' ')
    const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : ''
    const serverQueue = queue.get(message.guild.id)




    if (message.content.startsWith(`${PREFIX}play`)) {
        const voiceChannel = message.member.voice.channel
        var mustinchannelplay = new MessageEmbed()
            .setAuthor(`Something went wrong.`, client.user.avatarURL())
            .setTitle(`Uh oh!`)
            .setColor("608c9f")
            .setDescription(`You must be in a voicechannel to play music.`)
        if (!voiceChannel) return message.channel.send(mustinchannelplay)
        const permissions = voiceChannel.permissionsFor(message.client.user)
        var nopermsconnect = new MessageEmbed()
            .setColor("608c9f")
            .setAuthor(`Something went wrong.`, client.user.avatarURL())
            .setTitle(`Uh oh!`)
            .setDescription(`I don't have permissions to connect to the voicechannel.`)
        if (!permissions.has("CONNECT")) return message.channel.send(nopermsconnect)
        var nopermsspeak = new MessageEmbed()
            .setColor("608c9f")
            .setAuthor(`Something went wrong.`, client.user.avatarURL())
            .setTitle(`Uh oh!`)
            .setDescription(`I don't have permissions to speak in the voicechannel.`)
        if (!permissions.has('SPEAK')) return message.channel.send(nopermsspeak)

        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playList = await youtube.getPlaylist(url)
            const videos = await playList.getVideos()
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id)
                await handleVideo(video2, message, voiceChannel, true)
            }
            var playlistadded = new MessageEmbed()
                .setColor("608c9f")
                .setAuthor(`Playlist added`, client.user.avatarURL())
                .setDescription(`Added ${playList.title} to the queue`)
            message.channel.send(playlistadded)
            return undefined

        } else {
            try {
                var video = await youtube.getVideoByID(url)
            } catch {
                try {
                    var videos = await youtube.searchVideos(searchString, 10)
                    var index = 0
                    var songselection = new MessageEmbed()
                        .setAuthor(`Song Selection`, client.user.avatarURL())
                        .setColor("608c9f")
                        .setDescription(`${videos.map(video2 => `**${++index} -** \`${video2.title}\``).join(`\n`)}`)
                        .setFooter(`Please select one of the songs ranging from 1-10`)
                    message.channel.send(songselection)
                    try {
                        var responce = await message.channel.awaitMessages(msg => msg.content > 0 && msg.content < 11, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        })
                    } catch {
                        var invalidornoresult = ["I couldn't find any search results", "No or invalid song selection was provided"]
                        var invalidornoresults = invalidornoresult[Math.floor(Math.random() * invalidornoresult.length)]
                        message.channel.send(invalidornoresults)
                    }
                    const videoIndex = parseInt(responce.first().content)
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id)
                } catch {
                }
            }
            return handleVideo(video, message, voiceChannel)
        }

    } else if (message.content.startsWith(`${PREFIX}stop`)) {
        var mustinchannelstop = new MessageEmbed()
            .setAuthor(`Something went wrong.`, client.user.avatarURL())
            .setTitle(`Uh oh!`)
            .setColor("608c9f")
            .setDescription(`You must be in a voicechannel to stop the music.`)

        if (!message.member.voice.channel) return message.channel.send(mustinchannelstop)
        var nothingplaying = new MessageEmbed()
            .setAuthor(`Something went wrong.`, client.user.displayAvatarURL())
            .setTitle(`Uh oh!`)
            .setColor("608c9f")
            .setDescription(`There is nothing playing.`)
        if (!serverQueue) return message.channel.send(nothingplaying)
        var musicalreadypaused = new MessageEmbed()
            .setAuthor('Something went wrong.', client.user.avatarURL())
            .setTitle(`Uh oh!`)
            .setColor("608c9f")
            .setDescription(`The music is already paused.`)
        if (!serverQueue.playing) return message.channel.send(musicalreadypaused)
        serverQueue.playing = false
        serverQueue.connection.dispatcher.pause()
        message.channel.send(`**Paused** ⏸`)
        return undefined

    } else if (message.content.startsWith(`${PREFIX}skip`)) {
        var mustinchannelskip = new MessageEmbed()
            .setAuthor(`Something went wrong.`, client.user.avatarURL())
            .setTitle(`Uh oh!`)
            .setDescription(`You need to be in a voicechannel to skip the song.`)
            .setColor("608c9f")
        if (!message.member.voice.channel) return message.channel.send(mustinchannelskip)
        var nothingplaying = new MessageEmbed()
            .setAuthor(`Something went wrong.`, client.user.displayAvatarURL())
            .setTitle(`Uh oh!`)
            .setColor("608c9f")
            .setDescription(`There is nothing playing.`)
        if (!serverQueue) return message.channel.send(nothingplaying)
        serverQueue.connection.dispatcher.end()
        message.channel.send(" ⏩ ***Skipped*** 👍")
    } else if (message.content.startsWith(`${PREFIX}volume`)) {
        var voiceChannelforvolume = new MessageEmbed()
            .setAuthor(`Something went wrong.`, client.user.avatarURL())
            .setTitle(`Uh oh!`)
            .setDescription(`You need to be in a voicechannel to change to volume.`)
            .setColor("608c9f")
        if (!message.member.voice.channel) return message.channel.send(voiceChannelforvolume)
        var nothingplaying = new MessageEmbed()
            .setAuthor(`Something went wrong.`, client.user.displayAvatarURL())
            .setTitle(`Uh oh!`)
            .setColor("608c9f")
            .setDescription(`There is nothing playing.`)
        if (!serverQueue) return message.channel.send(nothingplaying)
        if (!args[1]) return message.channel.send(`The volume now: ${serverQueue.volume}.`)
        var novalidvolume = new MessageEmbed()
            .setAuthor(`Something went wrong.`, client.user.avatarURL())
            .setTitle(`Uh oh!`)
            .setDescription(`That is not a valid amount of change the volume in to.`)
            .setColor("608c9f")
        if (isNaN(args[1])) return message.channel.send(novalidvolume)
        serverQueue.volume = args[1]
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5)
        message.channel.send(`**Changed volume to ${args[1]} 🔊**`)
        return undefined

    } else if (message.content.startsWith(`${PREFIX}np`)) {
        var nothingplaying = new MessageEmbed()
            .setAuthor(`Something went wrong.`, client.user.displayAvatarURL())
            .setTitle(`Uh oh!`)
            .setColor("608c9f")
            .setDescription(`There is nothing playing.`)
        if (!serverQueue) return message.channel.send(nothingplaying)
        var np = new MessageEmbed()
            .setAuthor(`Now Playing`, client.user.avatarURL())
            .setColor("608c9f")
            .setTitle(`${serverQueue.songs[0].title}`)
        serverQueue.textChannel.send(np)
        return undefined

    } else if (message.content.startsWith(`${PREFIX}queue`)) {
        var nothingplaying = new MessageEmbed()
            .setAuthor(`Something went wrong.`, client.user.displayAvatarURL())
            .setTitle(`Uh oh!`)
            .setColor("608c9f")
            .setDescription(`There is nothing playing.`)
        if (!serverQueue) return message.channel.send(nothingplaying)
        var queueembed = new MessageEmbed()
            .setTitle(`Queue for ${message.guild.name}`)
            .setColor("608c9f")
            .setDescription(`__Now Playing:__\n${serverQueue.songs[0].title}\n\n__Whole List:__\n${serverQueue.songs.map(song => `**-** \`${song.title}\``).join('\n')}`)
        message.channel.send(queueembed)
        return undefined

    } else if (message.content.startsWith(`${PREFIX}resume`)) {
        var resumemusic = new MessageEmbed()
            .setDescription(`You need tot be in a voicechannel to resume the music.`)
            .setAuthor(`Something went wrong.`, client.user.avatarURL())
            .setTitle(`Uh oh!`)
            .setColor("608c9f")
        if (!message.member.voice.channel) return message.channel.send(resumemusic)
        var nothingplaying = new MessageEmbed()
            .setAuthor(`Something went wrong.`, client.user.displayAvatarURL())
            .setTitle(`Uh oh!`)
            .setColor("608c9f")
            .setDescription(`There is nothing playing.`)
        if (!serverQueue) return message.channel.send(nothingplaying)
        var notpaused = new MessageEmbed()
            .setColor("608c9f")
            .setAuthor(`Something went wrong.`, client.user.avatarURL())
            .setTitle(`Uh oh!`)
            .setDescription(`The music isn't paused.`)
        if (serverQueue.playing) return message.channel.send(notpaused)
        serverQueue.playing = true
        serverQueue.connection.dispatcher.resume()
        message.channel.send(`⏯ **Resuming** 👍`)
        return undefined

    } else if (message.content.startsWith(`${PREFIX}pause`)) {
        if (!message.member.voice.channel) return message.channel.send(mustinchannelstop)
        var nothingplaying = new MessageEmbed()
            .setAuthor(`Something went wrong.`, client.user.displayAvatarURL())
            .setTitle(`Uh oh!`)
            .setColor("608c9f")
            .setDescription(`There is nothing playing.`)
        if (!serverQueue) return message.channel.send(nothingplaying)
        var musicalreadypaused = new MessageEmbed()
            .setAuthor('Something went wrong.', client.user.avatarURL())
            .setTitle(`Uh oh!`)
            .setColor("608c9f")
            .setDescription(`The music is already paused.`)
        if (!serverQueue.playing) return message.channel.send(musicalreadypaused)
        serverQueue.playing = false
        serverQueue.connection.dispatcher.pause()
        message.channel.send(`**Paused** ⏸`)
        return undefined

    }
    return undefined
})

async function handleVideo(video, message, voiceChannel, playList = false) {
    const serverQueue = queue.get(message.guild.id)

    const song = {
        id: video.id,
        title: video.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        test: video.thumbnail

    }

    if (!serverQueue) {
        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            player: true
        }
        queue.set(message.guild.id, queueConstruct)

        queueConstruct.songs.push(song)

        try {
            var connection = await voiceChannel.join()
            queueConstruct.connection = connection
            play(message.guild, queueConstruct.songs[0])
        } catch (error) {
            console.log(`Connection error: ${error}.`)
            queue.delete(message.guild.id)
            return message.channel.send(`Connection error: ${error}.`)
        }
    } else {
        var addedqueue = new MessageEmbed()
            .setColor("608c9f")
            .setDescription(`Added ${song.title} to the queue.`)
        serverQueue.songs.push(song)
        if (playList) return undefined
        else return message.channel.send(addedqueue)
    }
    return undefined
}

function play(guild, song, message) {
    const serverQueue = queue.get(guild.id)

    if (!song) {
        serverQueue.voiceChannel.leave()
        queue.delete(guild.id)
        return
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url), { bitrate: 384000 })
        .on('finish', () => {
            serverQueue.songs.shift()
            play(guild, serverQueue.songs[0])

        })
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)

    var startplaying = new MessageEmbed()
        .setColor("608c9f")
        .setAuthor(`Now Playing`, client.user.avatarURL(), song.url)
        .setTitle(`${song.title}`, song.url)
    serverQueue.textChannel.send(startplaying)
}


client.login(process.env.token)