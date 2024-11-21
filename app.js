const express = require('express');
const dotenv = require('dotenv');
const db = require('./src/models');
const { connectToRedis } = require('./src/config/redis.js');
const { registerRoutes } = require('./src/routes/index.js');
const errorHandler = require('./src/middlewares/error.middleware');
const { initializeSchedulers } = require('./src/schedulers');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

dotenv.config();

const app = express();

// Load Swagger YAML
const swaggerDocument = YAML.load(path.join(__dirname, 'src/swaggers/swagger.yaml'));

// Set up Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Hello Word');
});

app.use(express.json());

registerRoutes(app);

app.use(errorHandler);

connectToRedis();

// Initialize Schedulers
initializeSchedulers();

// Connect to the database

db.sequelize
  .authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.error('Error connecting to database:', err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
