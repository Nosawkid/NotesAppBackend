const logger = require("./logger");

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown endpoint" });
};

const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

const errorHandler = (error, req, res, next) => {
  logger.error(error.name, error.message);
  if (error.name === "CastError") {
    return res.status(400).send({ error: "Malformatted Id" });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }
  if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    return res.status(400).json({ error: `expected 'username' to be unique` });
  }
  next(error);
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  requestLogger,
};
