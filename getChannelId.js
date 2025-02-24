const axios = require('axios');

const youtubeApiKey = 'AIzaSyBdclSF4_wcJd-raE2d--xI8eBhmCWpKOU'; // Your YouTube API key
const youtubeChannelName = 'Next.Level.N3xus'; // Your YouTube channel name

const getChannelId = async () => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: 'snippet',
        q: youtubeChannelName,
        type: 'channel',
        key: youtubeApiKey,
      },
    });

    const channelId = response.data.items[0].id.channelId;
    console.log('Your Channel ID:', channelId);
  } catch (error) {
    console.error('Error fetching channel ID:', error);
  }
};

getChannelId();
