const apiRouter = require("express").Router();
const topicRouter = require("./topics-router");
const { getHomepage } = require("../controllers/api-ctrl");

apiRouter.get("/", getHomepage);

apiRouter.use("/topics", topicRouter);

module.exports = apiRouter;
