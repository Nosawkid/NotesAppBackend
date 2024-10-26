const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Give Password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://mhdyaseensid:${password}@moocnotes.z9zos.mongodb.net/noteApp?retryWrites=true&w=majority&appName=MoocNotes`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

const Note = mongoose.model("Note", noteSchema);

const note = new Note({
  content: "HTML is easy",
  important: true,
});

// note.save().then((res) => {
//   console.log("note saved");
//   console.log(res);
//   mongoose.connection.close();
// });

Note.find({ important: true }).then((res) => {
  res.forEach((note) => {
    console.log(note);
  });
  mongoose.connection.close();
});
