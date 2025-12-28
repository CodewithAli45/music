const express = require("express");
const router = express.Router();

const { getAllSongs } = require("../controllers/musicController");

router.get("/", getAllSongs);

module.exports = router;

