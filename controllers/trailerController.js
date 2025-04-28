import axios from 'axios';

export const getTrailer = async (req, res) => {
  const { movie, year } = req.query;

  if (!movie || !year) {
    return res.status(400).json({ error: 'Missing movie or year query parameter.' });
  }

  const query = `${movie} (${year}) trailer 1`;
  const url = `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}&part=snippet&type=video`;

  try {
    const response = await axios.get(url);
    const videos = response.data.items;

    if (videos.length === 0) {
      return res.status(404).json({ error: 'Trailer not found.' });
    }

    const firstVideo = videos[0];
    const videoId = firstVideo.id.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    res.json({
      title: firstVideo.snippet.title,
      videoId: videoId,
      videoUrl: videoUrl,
      thumbnails: firstVideo.snippet.thumbnails,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch trailer.' });
  }
};
