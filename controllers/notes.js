const noteRouter = require("express").Router();
const Note = require("../models/notes");
const User = require("../models/user");

noteRouter.get("/", async (req, res) => {
  const response = await Note.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  res.json(response);
});

noteRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const note = await Note.findById(id).populate("user", {
    username: 1,
    name: 1,
  });
  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
});

noteRouter.post("/", async (request, response) => {
  const body = request.body;
  const user = await User.findById(body.userId);
  const savedNote = new Note({
    content: body.content,
    important: body.important || false,
    user: user.id,
  });
  await savedNote.save();
  user.notes.push(savedNote._id);
  await user.save();
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
