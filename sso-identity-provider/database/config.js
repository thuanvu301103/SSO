require('dotenv').config()

const Pool = require('pg').Pool

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}`

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || connectionString,
  ssl: process.env.DATABASE_URL ? false : true
})

module.exports = { pool }