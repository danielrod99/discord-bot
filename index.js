const Discord = require("discord.js");
const { prefix, token, key } = require("./config/config.json");
const ytdl = require("ytdl-core");
const puppeteer = require('puppeteer');

const client = new Discord.Client();

const queue = new Map();

client.once("ready", () => {
  console.log("Homunculbot conectado!");
});

client.once("reconnecting", () => {
  console.log("Reconectando!");
});

client.once("disconnect", () => {
  console.log("Homunculbot Desconectado!");
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    var searchData = message.content.split(" ");
    searchData.shift();
    if (searchData[0].indexOf('https://') != -1) { // YT link given to bot
      execute(message, serverQueue, null);
    } else { // Search in youtube
      let url = await navigateAndGetLink(message.content.substring(message.content.indexOf(' '), message.content.length));
      id = url.href;
      console.log(url, id)
      id = id.substring(id.lastIndexOf('?v=') + 3, id.length);
      execute(message, serverQueue, id);
    }
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}hola`)) {
    message.channel.send("Hola Holason");
  } else if (message.content.startsWith(`${prefix}manco`)) {
    message.channel.send("Luisillo Luisoson es MANCO");
  } else if (message.content.startsWith(`${prefix}help`)) {
    message.channel.send(`
      Homunculbot tiene estos comandos disponibles actualmente:
      - ${prefix}hola   / Saludar al grupo
      - ${prefix}manco  / Menciona al manco del grupo
      - ${prefix}play <link de YT> / Reproduce la cancion del link en el chat de voz
      - ${prefix}skip   / Se salta la cancion actual
      - ${prefix}stop   / Termina el chat de voz
    `);
  }
  else {
    message.channel.send("No existe ese comando!");
  }
});

async function execute(message, serverQueue, videoId) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "Tienes que estar en un canal de voz para poder reproducir musica"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "Homunculbot no tiene los permisos necesarios para conectarse"
    );
  }
  var songInfo;
  if (videoId) {
    songInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
  } else {
    songInfo = await ytdl.getInfo(args[1]);
  }
  var song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`**${song.title}** se agrego al queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "Tienes que estar en un canal de voz para poder reproducir musica"
    );
  if (!serverQueue)
    return message.channel.send("No hay mas canciones para hacer skip");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "Tienes que estar en un canal de voz para poder reproducir musica"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => { console.error(error) });
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Reproduciendo: **${song.title}**`);
}

client.login(token);

async function navigateAndGetLink(searchQuery) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://youtube.com');
  await page.click('input#search');
  await page.keyboard.type(searchQuery);
  await page.click('button#search-icon-legacy');
  await page.waitForSelector('ytd-video-renderer');
  await page.mouse.click(120, 220);
  var link = await page.evaluate(() => {
    return window.location;
  })
  await browser.close();
  return link;
}
