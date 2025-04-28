import express from 'express';

import trailerRoutes from './routes/trailer.js';
import gradesRoutes from './routes/grades.js'
  ;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/trailer', trailerRoutes);
app.use('/grade', gradesRoutes);

app.get('/', (req, res) => {
  res.send('API is running.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
