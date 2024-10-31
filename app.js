const config = require("./utils/config");
const express = require("express");
const app = express();
require("express-async-errors");
const cors = require("cors");
const notesRouter = require("./controllers/notes");
const logger = require("./utils/logger");
const mongoose = require("mongoose");
const {
  unknownEndpoint,
  errorHandler,
  requestLogger,
} = require("./utils/middleware");

console.log(process.env.NODE_ENV);

mongoose.set("strictQuery", false);
logger.info("Connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((error) => {
    logger.error("MongoDB Error: ", error.message);
  });

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));
app.use(requestLogger);
app.use("/api/notes", notesRouter);
app.use(unknownEndpoint);

app.use(errorHandler);

module.exports = app;
