import axios from 'axios';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const getTrailer = async (req, res) => {
  const { movie, year } = req.query;

  if (!movie || !year) {
    return res.status(400).json({ error: 'Missing movie or year query parameter.' });
  }

  try {
    const cachedResult = await db.execute({
      sql: "SELECT api_response FROM trailers WHERE movie_title = ? AND movie_year = ?",
      args: [movie, parseInt(year, 10)]
    });

    if (cachedResult.rows.length > 0) {
      // The response is stored as a JSON string, so parse it before sending
      const cachedResponse = JSON.parse(cachedResult.rows[0].api_response);
      return res.json(cachedResponse);
    }

    //If request is not cached
    const query = `${movie} (${year}) trailer 1`;
    const url = `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}&part=snippet&type=video`;

    const response = await axios.get(url);
    const videos = response.data.items;

    if (videos.length === 0) {
      return res.status(404).json({ error: 'Trailer not found.' });
    }

    const firstVideo = videos[0];
    const videoId = firstVideo.id.videoId;

    // This is the complete response object we'll send to the client
    const apiResponseObject = {
      title: firstVideo.snippet.title,
      videoId: videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnails: firstVideo.snippet.thumbnails,
    };
    //Caching request
    await db.execute({
      sql: "INSERT INTO trailers (movie_title, movie_year, api_response) VALUES (?, ?, ?)",
      args: [movie, parseInt(year, 10), JSON.stringify(apiResponseObject)]
    });

    res.json(apiResponseObject);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch trailer.' });
  }
};
