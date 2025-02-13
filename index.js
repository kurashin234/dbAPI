const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: '127.0.0.0',
  user: 'newSql',
  password: 'Strong@Passw0rd',
  database: 'test_db',
});

app.use(express.json());

db.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err.stack);
      return;
    }
    console.log('Connected to the database.');
  });

app.post('/setData', (req, res) => {
  const {id, name, age} = req.body;
  const query = 'insert into users (id, name, age) values (?, ?)';
  db.query(query + String(age), [id, name], (err, result) => {
    if (err){
      console.error('Error inserting data:', err);
      res.status(500).send('Failed to insert data.');
      return;
    }
    res.status(201).send('User added successfuly');
  });
});

app.get('/getData', (req, res) => {
  const query = 'SELECT * FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Database query failed.');
      return;
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});