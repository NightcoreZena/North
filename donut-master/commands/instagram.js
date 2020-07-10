const { MessageEmbed } = require('discord.js')
const axios = require('axios')

module.exports.run = async (client, message, args) => {

    let getInfo = async () => {
        if (!args[0]) return msg.channel.send("Please provide an account name!");
        let response = await axios.get(`https://apis.duncte123.me/insta/${args.join(" ")}`);
        let info = response.data;
        return info;
    };
    let infoValue = await getInfo();
    console.log(infoValue);

    const embed = new MessageEmbed()
        .setTitle(`Instagram Stats`)
        .setThumbnail(`${infoValue.user.profile_pic_url}`)
        .addField(`Username`, infoValue.user.username, true)
        .addField(`Fullname`, infoValue.user.full_name, true)
        .addField(`Biography`, infoValue.user.biography)
        .addField(`Uploads`, infoValue.user.uploads.count, true)
        .addField(`Followers`, infoValue.user.followers.count, true)
        .addField(`Following`, infoValue.user.following.count, true)
        .addField(`Private`, infoValue.user.is_private, true)
        .addField(`Verified`, infoValue.user.is_verified, true)
    message.channel.send(embed)
}

module.exports.help = {
    name: "instagram"
}