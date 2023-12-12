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

router.post("/insert-record", async (req, res) => {
    const { table, data } = req.body;
    try {
        console.log('Table: ', table);
        console.log('Data: ', data);
        // Execute Insert command

        const columnNames = [];
        const values = [];

        for (const obj of data) {
            const { id, text } = obj;

            columnNames.push(id);
            values.push(`'${text}'`);
        }

        console.log(`Column Names: `, columnNames);
        console.log(`Values: `, values);

        const columns = columnNames.join(', ');
        const valuePlaceholders = values.join(', ');

        // Constructing SQL query
        const query = `INSERT INTO ${table} (${columns}) VALUES (${valuePlaceholders})`;

        // console.log(query);
        const result = await pool.query(query);

        if (result.rowCount === 1) {
            return res.status(200).json("Success");
        }
    } catch (e) {
        console.error(`Error: `, e.message);
        return res.status(500).json("Server Error");
    }
});

module.exports = router;