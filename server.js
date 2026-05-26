const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("__dirname"));

/* TABLES */
app.get("/tables", (req, res) => {
    db.query("SHOW TABLES", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

/* COLUMNS */
app.get("/columns/:table", (req, res) => {
    db.query(`SHOW COLUMNS FROM \`${req.params.table}\``, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

/* SHOW TABLE */
app.get("/table/:table", (req, res) => {
    db.query(`SELECT * FROM \`${req.params.table}\``, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

/* DISTINCT VALUES for a column — used by Delete & Update dropdowns */
app.get("/distinct/:table/:col", (req, res) => {
    const { table, col } = req.params;
    db.query(
        `SELECT DISTINCT \`${col}\` FROM \`${table}\` ORDER BY \`${col}\``,
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
        }
    );
});

/* ADD */
app.post("/add/:table", (req, res) => {
    const table = req.params.table;
    const data = req.body;

    const cols = Object.keys(data).map(c => `\`${c}\``).join(", ");
    const values = Object.values(data);
    const placeholders = values.map(() => "?").join(", ");

    const sql = `INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders})`;

    db.query(sql, values, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Inserted" });
    });
});

/* DELETE */
app.post("/delete", (req, res) => {
    const { table, column, value } = req.body;

    db.query(
        `DELETE FROM \`${table}\` WHERE \`${column}\` = ?`,
        [value],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Deleted" });
        }
    );
});

/* UPDATE */
app.post("/update", (req, res) => {
    const { table, column, oldValue, newValue } = req.body;

    db.query(
        `UPDATE \`${table}\` SET \`${column}\` = ? WHERE \`${column}\` = ?`,
        [newValue, oldValue],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Updated" });
        }
    );
});

/* FIRST */
app.get("/first/:table", (req, res) => {
    db.query(
        `SELECT * FROM \`${req.params.table}\` LIMIT 1`,
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
        }
    );
});

/* LAST */
app.get("/last/:table", (req, res) => {
    db.query(
        `SELECT * FROM \`${req.params.table}\` ORDER BY 1 DESC LIMIT 1`,
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
        }
    );
});

/* CALC */
app.get("/calc/:table/:col/:func", (req, res) => {
    const { table, col, func } = req.params;
    const allowed = ["COUNT", "AVG", "SUM", "MIN", "MAX"];
    if (!allowed.includes(func.toUpperCase())) {
        return res.status(400).json({ error: "Invalid function" });
    }
    db.query(
        `SELECT ${func}(\`${col}\`) AS result FROM \`${table}\``,
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
        }
    );
});

/* SEARCH */
app.get("/search/:table/:column/:value", (req, res) => {
    const { table, column, value } = req.params;
    db.query(`SELECT * FROM \`${table}\` WHERE \`${column}\` = ?`, [value], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

/* CUSTOM QUERY */
app.post("/query", (req, res) => {
    const { sql } = req.body;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.listen(3000, () => console.log("Server running on port 3000 🚀"));
