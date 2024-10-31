const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Note = require("../models/notes");
const helper = require("./test_helper");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const api = supertest(app);

beforeEach(async () => {
  await Note.deleteMany({});
  await Note.insertMany(helper.initialNotes);
  await User.deleteMany({});
});
describe("When there is initially some notes saved", () => {
  test("Notes are returned as JSON", async () => {
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
});

describe("Viewing a specific note", () => {
  test("A specific note can be viewed", async () => {
    const noteAtStart = await helper.notesInDb();
    const noteToView = noteAtStart[0];

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(resultNote.body, noteToView);
  });

  test("fails with statuscode 404 if note does not exist", async () => {
    const validNonexistingId = await helper.nonExistingId();

    await api.get(`/api/notes/${validNonexistingId}`).expect(404);
  });

  test("fails with statuscode 400 id is invalid", async () => {
    const invalidId = "5a3d5da59070081a82a3445";

    await api.get(`/api/notes/${invalidId}`).expect(400);
  });

  // Adding
  describe("Addidtion of a new note", () => {
    test("A valid note can be added", async () => {
      const passwordHash = await bcrypt.hash("mockpassword", 10);
      const testUser = new User({
        username: "testUser",
        name: "Test User",
        passwordHash,
      });
      const newUser = await testUser.save();
      const newNote = {
        content: "Test note 3",
        important: true,
        userId: newUser._id,
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
      const passwordHash = await bcrypt.hash("mockpassword", 10);
      const testUser = new User({
        username: "testUser",
        name: "Test User",
        passwordHash,
      });
      const newUser = await testUser.save();
      const newNote = {
        important: true,
        userId: newUser._id,
      };

      await api.post("/api/notes").send(newNote).expect(400);

      const notesAtEnd = await helper.notesInDb();

      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length);
    });
  });

  describe("Deletion of a note", () => {
    test("A note can be deleted", async () => {
      const noteAtStart = await helper.notesInDb();
      const noteToView = noteAtStart[0];
      await api.delete(`/api/notes/${noteToView.id}`).expect(204);
      const notesAtEnd = await helper.notesInDb();
      const contents = notesAtEnd.map((e) => e.content);
      assert(!contents.includes(noteToView.content));
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
