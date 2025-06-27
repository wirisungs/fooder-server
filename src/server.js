require('dotenv').config();
const app = require('./app');
const db = require('./config/db.mongo.config');

db();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
