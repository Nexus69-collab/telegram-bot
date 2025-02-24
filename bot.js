const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

const token = '7731655040:AAEATmow7OPsrvmGmt_UtPJC_UZpGsQDV6M'; // Your bot token
const bot = new TelegramBot(token, { polling: true });

const channelId = '@NextLevelN3xus'; // Your channel ID
const youtubeApiKey = 'AIzaSyBdclSF4_wcJd-raE2d--xI8eBhmCWpKOU'; // Your YouTube API key
const youtubeChannelId = 'UCgocZeRyJ3lqZAx1zg-m6dQ'; // Your actual YouTube channel ID
const omdbApiKey = '8e9137e'; // Your OMDb API key

let lastVideoId = null;

// Load lastVideoId from file
const loadLastVideoId = () => {
  try {
    const data = fs.readFileSync('lastVideoId.txt', 'utf8');
    lastVideoId = data.trim();
  } catch (error) {
    console.error('Error reading lastVideoId file:', error);
  }
};

// Save lastVideoId to file
const saveLastVideoId = (videoId) => {
  try {
    fs.writeFileSync('lastVideoId.txt', videoId, 'utf8');
  } catch (error) {
    console.error('Error writing lastVideoId file:', error);
  }
};

// Add an array of jokes
const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "Why don't skeletons fight each other? They don't have the guts.",
  "Why did the bicycle fall over? Because it was two-tired!",
  "Why did the math book look sad? Because it had too many problems.",
  "Why don't programmers like nature? It has too many bugs.",
  "What do you call fake spaghetti? An impasta!",
  "Why can't you give Elsa a balloon? Because she will let it go.",
  "What do you call cheese that isn't yours? Nacho cheese!",
  "Why don't seagulls fly over the bay? Because then they'd be bagels!",
];

let recentlyUsedJokes = [];

bot.onText(/\/start/, (msg) => {
  const introMessage = `
  Welcome to the Next Level Nexus Bot!
  Use /help to see available commands.
  
  Check out our YouTube channel for more content: [Next.Level.N3xus](https://www.youtube.com/@Next.Level.N3xus)
  `;
  bot.sendMessage(msg.chat.id, introMessage);
});

// Send a message to the channel when the bot starts
bot.sendMessage(channelId, 'Hello everyone! FlickNexus bot is now active in this channel. Use /help to see available commands.');

bot.onText(/\/help/, (msg) => {
  const commands = `
  /start - Begin your journey with the Next Level Nexus Bot.
  /help - Get a list of available commands and features.
  /movies - Browse the latest movie trailers and full movies.
  /games - Discover the hottest upcoming gaming trailers.
  /recommend - Get personalized movie and game recommendations.
  /discuss - Join engaging discussions about movies and games.
  /request - Submit your requests for specific trailers or genres.
  /about - Learn more about the Next Level Nexus Bot.
  /movieinfo [movie name] - Get detailed information about a movie (use: /movieinfo [movie name]).
  /joke - Get a random joke to brighten your day!
  `;
  bot.sendMessage(msg.chat.id, commands);
});

bot.onText(/\/joke/, (msg) => {
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * jokes.length);
  } while (recentlyUsedJokes.includes(randomIndex));

  const randomJoke = jokes[randomIndex];
  bot.sendMessage(msg.chat.id, randomJoke);

  recentlyUsedJokes.push(randomIndex);
  if (recentlyUsedJokes.length > 5) {
    recentlyUsedJokes.shift(); // Keep the last 5 jokes used
  }
});

let movieInfoPending = false;
let pendingChatId = null;

bot.onText(/\/movieinfo/, (msg) => {
  bot.sendMessage(msg.chat.id, "Please enter the name of the movie you want information about:");
  movieInfoPending = true;
  pendingChatId = msg.chat.id;
});

bot.on('message', async (msg) => {
  if (movieInfoPending && msg.chat.id === pendingChatId && !msg.text.startsWith('/')) {
    movieInfoPending = false;
    pendingChatId = null;
    const movieName = msg.text;

    try {
      const response = await axios.get(`http://www.omdbapi.com/?t=${movieName}&apikey=${omdbApiKey}`);
      const movie = response.data;
      if (movie.Response === "True") {
        const movieInfo = `
        🎬 **${movie.Title}** (${movie.Year})
        ⭐ Rating: ${movie.imdbRating}/10
        📝 Overview: ${movie.Plot}
        🖼️ Poster: ${movie.Poster}
        `;
        bot.sendMessage(msg.chat.id, movieInfo);
      } else {
        bot.sendMessage(msg.chat.id, `Sorry, I couldn't find any information about "${movieName}".`);
      }
    } catch (error) {
      console.error('Error fetching movie information:', error);
      bot.sendMessage(msg.chat.id, 'Sorry, there was an error fetching the movie information.');
    }
  }
});

const fetchLatestVideo = async () => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: 'snippet',
        channelId: youtubeChannelId,
        order: 'date',
        type: 'video',
        key: youtubeApiKey,
      },
    });

    const latestVideo = response.data.items[0];

    if (latestVideo.id.videoId !== lastVideoId) {
      lastVideoId = latestVideo.id.videoId;
      saveLastVideoId(lastVideoId);
      bot.sendMessage(channelId, `🎉 New video alert! Check out our latest video: https://www.youtube.com/watch?v=${latestVideo.id.videoId}`);
    }
  } catch (error) {
    console.error('Error fetching latest video:', error);
  }
};

// Load lastVideoId when the bot starts
loadLastVideoId();

// Check for new videos every 10 minutes (600,000 milliseconds)
setInterval(fetchLatestVideo, 600000);

const postScheduledContent = () => {
  const content = [
    "🎬 Movie of the Day: Check out this must-watch film!",
    "🎮 Gaming News: Stay updated with the latest in the gaming world!",
    "🤩 Fun Fact: Did you know that...?",
  ];

  const randomContent = content[Math.floor(Math.random() * content.length)];
  bot.sendMessage(channelId, randomContent);
};

// Post content every 6 hours (21,600,000 milliseconds)
setInterval(postScheduledContent, 21600000);

const postEngagementPrompt = () => {
  const prompts = [
    "📊 Poll: What's your favorite movie genre? Reply with your choice!",
    "🎮 Challenge: Share a screenshot of your highest gaming score!",
    "💬 Discussion: What's the best movie you've watched recently?",
  ];

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  bot.sendMessage(channelId, randomPrompt);
};

// Post engagement prompt every day at a specific time (e.g., 8 AM)
const postTime = new Date();
postTime.setHours(8, 0, 0, 0);

setTimeout(() => {
  postEngagementPrompt();
  setInterval(postEngagementPrompt, 86400000);
}, postTime.getTime() - Date.now());

bot.on('message', (msg) => {
  const text = msg.text.toLowerCase();

  if (text.includes('favorite movie')) {
    bot.sendMessage(msg.chat.id, "🎬 What's your favorite movie? Share it with us!");
  }
  // Add more keyword responses here...
});

console.log('Bot is running...');
