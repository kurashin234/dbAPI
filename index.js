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

//タスクを追加
app.post("/setTask", (req, res) => {
  const {taskName, group_id} = req.body;

  db.query(
    'insert into tasks (taskName, group_id) values (?, ?)',
    [taskName, group_id],
    (err, result) =>{
      if (err){
        console.error("Error:", err);
        res.status(500).send("Failed to insert data");
        return;
      }
      res.status(201).send("OK");
    }
  );
});

//タスク削除
app.put("/deleteTask", (req, res) => {
  const {id} = req.query;

  db.query(
    'update tasks set delete_at = now() where id = ? and delete_at is null',
    id,
    (err, result) => {
      if (err){
        console.error("Error:", err);
        res.status(500).send("Failed to update data");
        return;
      }
      //console.log(result);
      if (result.affectedRows == 0){
        res.status(400).send("not data");
        return;
      }
      res.status(201).send("OK");
    }
  );
});

//タスクを取得
app.get('/getTask', (req, res) => {
  const {group_id} = req.query;

  db.query(
    'select taskName, group_id from tasks where group_id = ? and delete_at is null',
    group_id,
    (err, result) => {
      if (err){
        console.error("Error: ", err);
        res.status(500).send("Failed to get task data");
        return;
      }
      
      if(result.length == 0){
        res.status(400).send("not data");
        return;
      }
      res.status(201).send(result);
    }
  );
});

//urlの追加
app.post("/setUrl", (req, res) => {
  const {url, tasks_id} = req.body;

  db.query(
    'insert into urls (url, tasks_id) values (?, ?)',
    [url, tasks_id],
    (err, result) =>{
      if (err){
        console.error("Error", err);
        res.status(500).send("Failed to insert url data");
        return;
      }

      res.status(201).send("OK");
    }
  );
});

//url削除
app.put('/deleteUrl', (req, res) => {
  const {id} = req.query;

  db.query(
    'update urls set delete_at = now() where id = ? and delete_at is null',
    id,
    (err, result) => {
      if (err){
        console.error("Error", err);
        res.status(500).send("Failed to delete url");
        return;
      }

      if (result.affectedRows == 0){
        res.status(400).send("not data");
        return;
      }

      res.status(201).send("OK");
    }
  );
});

//url取得
app.get('/getUrl', (req, res) => {
  const {tasks_id} = req.query;

  db.query(
    'select url from urls where tasks_id = ? and delete_at is null',
    tasks_id,
    (err, result) => {
      if (err){
        console.error("Error:", err);
        res.status(500).send("Failed to get url");
      }

      res.status(201).send(result);
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});