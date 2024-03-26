const express = require("express");
const router = express.Router();
const cors = require("cors");
const dotenv = require("dotenv").config();
const crypto = require("crypto");
const request = require("request");
const pool = require("./../../db");
const ExcelJS = require("exceljs");


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

router.get("/get-search-list/:tableName", async (req, res) => {
  const { tableName } = req.params;
  const { search } = req.query;

  try {
      // Get the column lists
      const columnsQuery = `SELECT column_name, data_type FROM information_schema.columns 
                              WHERE table_name = $1 
                              AND data_type IN ('text', 'character varying', 'uuid', 'date')`;
      const columnsResult = await pool.query(columnsQuery, [tableName]);
      const columns = columnsResult.rows.map(row => ({ name: row.column_name, type: row.data_type }));

      // Search in each column
      const conditions = columns.map(column => {
        if (column.type === 'uuid' || column.type === 'date') {
            return `CAST(${column.name} AS text) ILIKE '%${search}%'`;
        } else {
            return `${column.name} ILIKE '%${search}%'`;
        }
    }).join(" OR ");
      const selectQuery = `SELECT * FROM ${tableName} WHERE ${conditions}`;

      const selectResult = await pool.query(selectQuery);
      console.log(`Load table`);
      return res.status(200).json({ message: "Success", recordList: selectResult.rows });
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
    const { table, user, data } = req.body;
    try {
        console.log('Table: ', table);
        console.log('Data: ', data);
        // Execute Insert command

        const columnNames = ['user_id'];
        const values = [`'${user}'`];

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
        const query = `INSERT INTO ${table} (${columns}) VALUES (${valuePlaceholders}) RETURNING id`;

        // console.log(query);
        const result = await pool.query(query);

        if (result.rowCount === 1) {
          const insertedId = result.rows[0].id; // Retrieve the inserted ID
          console.log(`Inserted ID: ${insertedId}`);
          return res.status(200).json({ message: "Success", id: insertedId });
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

router.post("/submit-record", async (req, res) => {
    const { table, status, id } = req.body;

    try{
        
        const query = `UPDATE ${table} SET approval_status = '${status}' WHERE id = '${id}'`;

        const result = await pool.query(query); 

        if (result.rowCount === 1) {
          return res.status(200).json("Success");
      } else {
          return res.status(404).json("Record not found");
      }
    } catch (error) {
      console.error(`Error while submitting record: `, error);
      return res.status(500).json("Server Error");
    }
  }); 

router.delete('/delete-record', async (req, res) => {
    const { id, table } = req.body;
  
    try {
      const result = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  
      if (result.rowCount === 1) {
        return res.status(200).json("Record deleted successfully");
      } else {
        return res.status(404).json("Record not found");
      }
    } catch (error) {
      console.error(`Error while deleting record: `, error);
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

router.get("/export-record/:tableName/:recordId", async (req, res) => {
    const { tableName, recordId } = req.params;
  
    try {
      const selectQuery = `SELECT * FROM ${tableName} WHERE id = $1`;
      const selectResult = await pool.query(selectQuery, [recordId]);
  
      if (selectResult.rows.length === 0) {
        return res.status(404).json("Record not found");
      }
  
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Record");
  
      // Add headers to the worksheet (excluding id and date_created)
      const columns = Object.keys(selectResult.rows[0]).filter(
        (col) => col !== "id" && col !== "date_created"
      );
      worksheet.addRow(columns);
  
      // Add the record to the worksheet (excluding id and date_created)
      const rowData = columns.map((col) => selectResult.rows[0][col]);
      worksheet.addRow(rowData);
  
      // Set content type and send the file with a dynamic filename
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${recordId}.xlsx`
      );
  
      // Write to the response stream
      await workbook.xlsx.write(res);
  
      // End the response
      res.end();
    } catch (error) {
      console.error(`Error while exporting record: `, error);
      res.status(500).json("Server Error");
    }
  });
  
  router.get("/export-page-record/:tableName", async (req, res) => {
    const { tableName } = req.params;
  
    try {
      const selectQuery = `SELECT * FROM ${tableName}`;
      const selectResult = await pool.query(selectQuery);
  
      if (selectResult.rows.length === 0) {
        return res.status(404).json("No records found");
      }
  
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Record");
  
      // Add headers to the worksheet (excluding id and date_created)
      const columns = Object.keys(selectResult.rows[0]).filter(
        (col) => col !== "id" && col !== "date_created"
      );
      worksheet.addRow(columns);
  
      // Add each record to the worksheet (excluding id and date_created)
      for (const row of selectResult.rows) {
        const rowData = columns.map((col) => row[col]);
        worksheet.addRow(rowData);
      }
  
      // Set content type and send the file
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename=${tableName}.xlsx`);
  
      // Write to response stream
      await workbook.xlsx.write(res);
  
      // End the response
      res.end();
    } catch (error) {
      console.error(`Error while exporting records: `, error);
      res.status(500).json("Server Error");
    }
  });

module.exports = router;