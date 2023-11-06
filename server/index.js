const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const app = express();


const PORT = process.env.PORT|5000;

app.use(express.json());
app.use(cors());

// Route to backend function
app.use("/api", require("./routes/api"));

// For connection testing purpose, PLEASE DO NOT REMOVE
app.get('/', async (req, res) => {
    try {
        res.json("Index");
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
