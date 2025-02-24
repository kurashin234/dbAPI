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

//ユーザーを追加する
app.post('/setUser', (req, res) => {
  const {name, password, group_id} = req.body;

  db.query(
    'insert into users (name, password, group_id) values (?, ?, ?)', //table作成時に重複エラー設定済み
    [name, password, group_id], 
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.error('Duplicate entry:', err);
          res.status(400).send('User already exists.');
          return;
        }
        console.error('INSERT error:', err);
        res.status(500).send('Failed to insert data.');
        return;
      }
      res.status(201).send('User added successfully');
    }
  );
});

//ユーザーが存在しているかチェック
app.get('/checkUser', (req, res) => {
  const {name, password, group_id} = req.query;
  db.query(
    'select * from users where name = ? and password = ? and group_id = ?',
    [name, password, group_id],
    (err, results) => {
      if (err){
        console.error('Error executing query', err);
        res.status(500).send('err');
        return;
      }
      //ユーザーが存在している場合trueをjsonで返す
      res.json({"checkResult": results.length > 0});
    }
  );
});

app.get('/getData', (req, res) => {
  db.query(
    'select * from users', 
    (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('error' + err);
        return;
      }
      res.json(results);
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});