const app = require("./app");
require("dotenv").config();
const config = require("./utils/config");
const logger = require("./utils/logger");

const PORT = config.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running at ${PORT}`);
});
