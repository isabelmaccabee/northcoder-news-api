const app = require("express")();
const bodyParser = require("body-parser");
const apiRouter = require("./routes/api-router");

app.use(bodyParser.json());

app.use("/api", apiRouter);

app.use("/*", (req, res, next) => {
  next({ err: 404, message: "Page not found" });
});

app.use((err, req, res, next) => {
  console.log(err);
  if (err) return res.status(err.err).send({ message: err.message });
  res.status(500).send({ message: "Internal server error sorry" });
});

module.exports = app;
