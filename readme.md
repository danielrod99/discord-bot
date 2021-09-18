# Bot for Discord
Basic bot for discord for joining the voice channel and reproduce music from a youtube URL

## Instructions for discord bot

1. Create a bot application on discord.
2. Create a folder in this app named config.
3. Add a file named *config.json* inside that folder.
4. Fill the json with this structure:
```javascript
{
    "prefix": "h!", // The name that will make the bot to react to messages
    "token": "<your-token>", // Bot token obtained from the discord bot dashboard
    "key": "<your-public-key>"  //  Public key obtained from the discord bot dashboard
}
```
5. Invite your bot to your server using the link _https://discord.com/oauth2/authorize?client_id=*YOUR-BOT-ID*&permissions=1133584&scope=bot_
6. Run the bot and try it!
## Usage
1. Once the bot is already in a server, join to a voice channel and run the command to play a song you can put the YT link or a search string that the bot will search in YT.
### Example
Here the prefix for the bot is h!
```
h!play https://www.youtube.com/watch?v=dQw4w9WgXcQ
```
or
```
h!play Never Gonna Give You Up Rick Astley
```

