import axios from "axios";

export const getGrades = async (req, res) => {
  const { movie, year } = req.query

  if (!movie || !year) {
    return res.status(400).json({ error: 'Missing movie or year query parameter.' });
  }

  const url = `https://www.omdbapi.com/?t=${movie}&y=${year}&apikey=${process.env.OMDB_API_KEY}`

  try {
    const response = await axios.get(url);
    const grades = response.data;

    if(grades.Error) {
      return res.status(404).json({error : grades.Error})
    }

    res.json({
      imdbID : grades.imdbID,
      imdbRating: grades.imdbRating,
      imdbVotes: grades.imdbVotes,
      otherRatings: grades.Ratings
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch grades from OMDB.' });
  }
};
