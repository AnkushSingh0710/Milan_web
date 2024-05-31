import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 5000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost", 
  database: "Milan",
  password: "root",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/public/style.css", (req, res) => {
  res.sendFile(__dirname + "/public/style.css");
});

app.use('/images', express.static(__dirname + '/images'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/home.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/views/register.html");
});

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const number = req.body.number;
  const hostel = req.body.hostel;

  try {
    const checkResult = await db.query("SELECT * FROM milan WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      const result = await db.query(
        "INSERT INTO milan (name, email, password, number, hostel) VALUES ($1, $2, $3, $4, $5)",
        [name, email, password, number, hostel]
      );
      console.log(result);
      res.sendFile(__dirname + "/views/home.html");
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM milan WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;

      if (password === storedPassword) {
        res.sendFile(__dirname + "/views/home.html");
      } else {
        res.send("Incorrect Password");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
