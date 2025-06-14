import axios from "axios";
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const getGrades = async (req, res) => {
  const { movie, year } = req.query

  if (!movie || !year) {
    return res.status(400).json({ error: 'Missing movie or year query parameter.' });
  }

  try {
    const cachedResult = await db.execute({
      sql: "SELECT api_response FROM grades WHERE movie_title = ? AND movie_year = ?",
      args: [movie, year]
    });

    if (cachedResult.rows.length > 0) {
      // The response is stored as a JSON string, so parse it before sending
      const cachedResponse = JSON.parse(cachedResult.rows[0].api_response);
      return res.json(cachedResponse);
    }

    //If cached response is not found, request from OMDB
    const url = `https://www.omdbapi.com/?t=${movie}&y=${year}&apikey=${process.env.OMDB_API_KEY}`

    const response = await axios.get(url);
    const grades = response.data;

    if(grades.Error) {
      return res.status(404).json({error : grades.Error})
    }

    const apiResponseObject = {
      imdbID: grades.imdbID,
      imdbRating: grades.imdbRating,
      imdbVotes: grades.imdbVotes,
      otherRatings: grades.Ratings
    };

    await db.execute({
      sql: "INSERT INTO grades (movie_title, movie_year, api_response) VALUES (?, ?, ?)",
      args: [movie, year, JSON.stringify(apiResponseObject)]
    });

    res.json(apiResponseObject);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch grades from OMDB.' });
  }
};
