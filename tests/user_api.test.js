const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const helper = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash("sekret", 10);
  const user = new User({ username: "root", passwordHash });
  await user.save();
});

describe("When there is initially one user in db", () => {
  test("Creation succeeds with a fresh username", async () => {
    const userAtStart = await helper.usersInDb();
    const newUser = {
      username: "John Doe",
      name: "John Doe",
      password: "hello",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const userAtEnd = await helper.usersInDb();
    assert.strictEqual(userAtEnd.length, userAtStart.length + 1);
    const usernames = userAtEnd.map((el) => el.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };
    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes(`expected 'username' to be unique`));
    assert.strictEqual(usersAtStart.length, usersAtEnd.length);
  });
});

after(async () => {
  mongoose.connection.close();
});
