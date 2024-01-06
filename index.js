const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");

const app = express();
const port = 2000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Sadvi@203",
  database: "mysql",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to the database");
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }

      db.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, password],
        (err) => {
          if (err) {
            console.error("Database query error:", err.message);
            return res.status(500).json({ message: "Internal Server Error" });
          }

          const token = jwt.sign({ username }, { expiresIn: "1h" });
          res.json({ token });
        }
      );
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ username }, { expiresIn: "1h" });
      res.json({ token });
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
