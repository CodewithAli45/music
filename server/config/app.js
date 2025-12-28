const express = require("express");
const cors = require("cors");

const songRoutes = require("../routes/songs");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Music API running");
});

app.use("/api/songs", songRoutes);

module.exports = app;
