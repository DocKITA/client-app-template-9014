const express = require("express");
const router = express.Router();
const cors = require("cors");
const dotenv = require("dotenv").config();
const crypto = require("crypto");
const request = require("request");
const pool = require("./../../db");

// Allow router to use these library
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/get-record-list/:tableName", async (req, res) => {
    const { tableName } = req.params;
    try {
        const selectQuery = `SELECT * FROM ${tableName}`;
        const selectResult = await pool.query(selectQuery);
        console.log(`Load table`);
        return res.json({ recordList: selectResult.rows });
    } catch (e) {
        console.error(`Error: `, e.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;