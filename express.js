import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import trailerRoutes from './routes/trailer.js';
import gradesRoutes from './routes/grades.js';

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())
app.use('/trailer', trailerRoutes);
app.use('/grade', gradesRoutes);

app.get('/', (req, res) => {
  res.send('API is running.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
