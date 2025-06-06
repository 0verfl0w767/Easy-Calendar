const express = require("express")
const bodyParser = require("body-parser")
const http = require("http")

const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database("./db.sqlite")
db.run(`CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  start TEXT NOT NULL,
  end TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#0288d1'
)`)

const app = express()

app.use(bodyParser.json())

app.get("/calendar", (req, res) => {
  res.status(200).sendFile(__dirname + "/calendar.html")
})

app.get("/api/events", (req, res) => {
  db.all("SELECT * FROM events", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.post("/api/events", (req, res) => {
  const { title, start, end, color } = req.body
  db.run(
    "INSERT INTO events (title, start, end, color) VALUES (?, ?, ?, ?)",
    [title, start, end, color],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ id: this.lastID })
    },
  )
})

app.delete("/api/events/:id", (req, res) => {
  const id = req.params.id
  db.run("DELETE FROM events WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
})

app.get("*", (req, res) => {
  res.status(404).json({ statusCode: 404, message: "unknown request." })
})

http.createServer(app).listen(1234, "0.0.0.0")
