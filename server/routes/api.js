const express = require('express');
const router = express.Router();
const cors = require('cors');

// Allow router to use these library
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// For connection testing purpose, PLEASE DO NOT REMOVE
router.get('/', async (req, res) => {
    try {
        console.log("API");
        res.json("API");
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;