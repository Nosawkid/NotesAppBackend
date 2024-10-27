const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const Note = require("./models/notes");

app.use(cors());

app.use(express.json());
// app.use(requestLogger);

app.use(express.static("dist"));

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
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});

app.post("/api/notes", (req, res, next) => {
  const body = req.body;
  if (!req.body.content) {
    return res.status(400).json({
      error: "Content Missing",
    });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note.save().then((savedNote) => {
    res.json(savedNote);
  });
});

app.get("/api/notes/:id", (req, res, next) => {
  const { id } = req.params;
  Note.findById(id)
    .then((note) => {
      if (note) {
        res.json(note);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => {
      return next(err);
    });
});

app.put("/api/notes/:id", (req, res, next) => {
  const { id } = req.params;
  const body = req.body;
  const note = {
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(id, note, { new: true })
    .then((updatedNote) => {
      res.json(updatedNote);
    })
    .catch((err) => {
      return next(err);
    });
});

app.delete("/api/notes/:id", (req, res, next) => {
  Note.findByIdAndDelete(req.params.id)
    .then((deletedItem) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

// app.get("/api/notes/:id", (request, response) => {
//   Note.findById(request.params.id)
//     .then((note) => {
//       if (note) {
//         response.json(note);
//       } else {
//         response.status(404).end();
//       }
//     })
//     .catch((error) => {
//       console.log(error);

//       response.status(400).send({ error: "malformatted id" });
//     });
// });

app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  notes = notes.filter((note) => note.id !== id);
  res.status(204).end();
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.log(error.message, error.name);
  if (error.name === "CastError") {
    return res.status(400).send({ error: "Malformatted Id" });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log("App running at", PORT);
