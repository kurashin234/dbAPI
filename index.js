require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,  // 最大接続数
  queueLimit: 0
});

app.use(express.json());

app.post('/setData', (req, res) => {
  const {id, name, age} = req.body;
  db.query(
    'insert into users (id, name, age) values (?, ?, ?)', 
    [id, name, age], 
    (err, result) => {
      if (err){
        console.error('Error inserting data:', err);
        res.status(500).send('Failed to insert data.');
        return;
      }
      res.status(201).send('User added successfuly');
    }
  );
});

app.get('/getData', (req, res) => {
  db.query(
    'select * from users', 
    (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Database query failed.');
        return;
      }
      res.json(results);
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});