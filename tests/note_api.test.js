const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Note = require("../models/notes");
const helper = require("./test_helper");

const api = supertest(app);

beforeEach(async () => {
  await Note.deleteMany({});
  console.log("DB Cleared");
  const noteObjects = helper.initialNotes.map((note) => new Note(note));
  const promiseArray = noteObjects.map((note) => note.save());
  await Promise.all(promiseArray);
});

test("Notes are returned as JSON", async () => {
  console.log("Entered test");
  await api
    .get("/api/notes")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("All notes are returned", async () => {
  const res = await api.get("/api/notes");
  assert.strictEqual(res.body.length, helper.initialNotes.length);
});

test("First note is not important", async () => {
  const res = await api.get("/api/notes");
  const contents = res.body.map((e) => e.content);
  assert(contents.includes("HTML is easy"));
});

test("A valid note can be added", async () => {
  const newNote = {
    content: "Test note 3",
    important: true,
  };
  await api
    .post("/api/notes")
    .send(newNote)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const noteAtEnd = await helper.notesInDb();
  assert.strictEqual(noteAtEnd.length, helper.initialNotes.length + 1);
  const contents = noteAtEnd.map((n) => n.content);
  assert(contents.includes("Test note 3"));
});

test("A note without content won't be saved to database", async () => {
  const newNote = {
    important: true,
  };

  await api.post("/api/notes").send(newNote).expect(400);

  const notesAtEnd = await helper.notesInDb();

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length);
});

test("A specific note can be viewed", async () => {
  const noteAtStart = await helper.notesInDb();
  const noteToView = noteAtStart[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert.deepStrictEqual(resultNote.body, noteToView);
});

test("A note can be deleted", async () => {
  const noteAtStart = await helper.notesInDb();
  const noteToView = noteAtStart[0];
  await api.delete(`/api/notes/${noteToView.id}`).expect(204);
  const notesAtEnd = await helper.notesInDb();
  const contents = notesAtEnd.map((e) => e.content);
  assert(!contents.includes(noteToView.content));
});

after(async () => {
  await mongoose.connection.close();
});
