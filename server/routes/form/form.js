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

router.post("/get-record", async (req, res) => {
    const { table, record_id } = req.body;
    try {
        const selectQuery = `SELECT * FROM ${table} WHERE id = '${record_id}'`;
        const selectResult = await pool.query(selectQuery);
        console.log("Load Record");
        return res.json({ record: selectResult.rows[0] });
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

router.post("/update-record", async (req, res) => {
    const { table, data, id } = req.body;

    try {
        // Constructing SQL update query
        const updateColumns = data.map(obj => `${obj.id} = '${obj.text}'`).join(', ');
        const query = `UPDATE ${table} SET ${updateColumns} WHERE id = '${id}'`;

        const result = await pool.query(query);

        if (result.rowCount === 1) {
            return res.status(200).json("Success");
        } else {
            return res.status(404).json("Record not found");
        }
    } catch (e) {
        console.error(`Error: `, e.message);
        return res.status(500).json("Server Error");
    }
});


// For connection testing purpose, PLEASE DO NOT REMOVE
router.get('/', async (req, res) => {
    try {
        console.log("FORM");
        res.json("FORM");
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;