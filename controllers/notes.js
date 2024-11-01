const noteRouter = require("express").Router();
const Note = require("../models/notes");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Getting token
const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

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
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  console.log(decodedToken);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }
  const user = await User.findById(decodedToken.id);

  const note = new Note({
    content: body.content,
    important: body.important === undefined ? false : body.important,
    user: user._id,
  });

  const savedNote = await note.save();
  user.notes = user.notes.concat(savedNote._id);
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
