const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.static("dist"));

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

app.use(cors());

const requestLogger = (req, res, next) => {
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Body:", req.body);
  console.log("------------------");
  next();
};

app.use(express.json());
// app.use(requestLogger);

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true,
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

const generateId = () => {
  const maxId =
    notes.length > 0 ? Math.max(...notes.map((n) => Number(n.id))) : 0;
  return maxId + 1;
};

app.get("/", (req, res) => {
  res.send(`<h1>Hello World</h1>`);
});

app.get("/api/notes", (req, res) => {
  res.json(notes);
});

app.post("/api/notes", (req, res) => {
  if (!req.body.content) {
    return res.status(400).json({
      error: "Content Missing",
    });
  }

  const note = {
    content: req.body.content,
    important: Boolean(req.body.important) || false,
    id: String(generateId()),
  };

  notes = notes.concat(note);
  res.json(note);
});

app.get("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  const note = notes.find((note) => note.id === id);
  if (!note) {
    return res.status(404).end();
  }
  res.json(note);
});

app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  notes = notes.filter((note) => note.id !== id);
  res.status(204).end();
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log("App running at", PORT);
