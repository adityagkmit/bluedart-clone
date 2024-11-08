const express = require('express');
const dotenv = require('dotenv');
const db = require('./src/models');

dotenv.config();

const app = express();


app.get('/', (req, res) => {
  res.send('Hello Word')
});

// Connect to the database

db.sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.error('Error connecting to database:', err));


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
