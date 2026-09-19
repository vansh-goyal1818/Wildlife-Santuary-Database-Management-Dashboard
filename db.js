const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Vansh@1818",
    database: "wildlife_santuary"
});

db.connect(err => {
    if (err) {
        console.log(err);
    } else {
        console.log("DB Connected ✅");
    }
});

module.exports = db;