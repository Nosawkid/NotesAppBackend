const noteRouter = require("express").Router();
const Note = require("../models/notes");

noteRouter.get("/", async (req, res) => {
  const response = await Note.find({});
  res.json(response);
});

noteRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const note = await Note.findById(id);
  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
});

noteRouter.post("/", async (request, response) => {
  const body = request.body;
  const savedNote = new Note({
    content: body.content,
    important: body.important || false,
  });
  await savedNote.save();
  response.status(201).json(savedNote);
});

noteRouter.delete("/:id", async (request, response) => {
  const { id } = request.params;
  await Note.findByIdAndDelete(id);
  response.status(204).end();
});

noteRouter.put("/:id", (request, response, next) => {
  const body = request.body;

  const note = {
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(request.params.id, note, {
    new: true,
    runValidators: true,
  })
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

module.exports = noteRouter;
