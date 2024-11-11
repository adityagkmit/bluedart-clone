const express = require('express');
const dotenv = require('dotenv');
const db = require('./src/models');
const { connectToRedis } = require('./src/config/redis.js');
const { registerRoutes } = require('./src/routes/index.js');

dotenv.config();

const app = express();

app.get('/', (req, res) => {
  res.send('Hello Word');
});

app.use(express.json());

registerRoutes(app);

connectToRedis();

// Connect to the database

db.sequelize
  .authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.error('Error connecting to database:', err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
