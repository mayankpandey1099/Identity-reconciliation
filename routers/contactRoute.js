const express = require("express");
const router = express.Router();
const registerContact = require("../controllers/contactController");

router.post("/identity",registerContact);

module.exports = router;