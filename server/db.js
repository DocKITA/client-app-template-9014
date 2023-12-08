const Pool = require('pg').Pool;
const dotenv = require('dotenv').config();

// Retrieve data from .env file
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;