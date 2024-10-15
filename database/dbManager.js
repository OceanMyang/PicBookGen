const mysql = require("mysql2/promise");

const con = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "files",
});

const getAllFiles = () => {
  con.query("SELECT * FROM files", (err, result) => {
    if (err) throw err;
    console.log(result);
    return result;
  });
};

const regisFile = (name, author) => {
  con.query(
    `INSERT INTO files (name, author) VALUES (?, ?)`,
    [name, author],
    (err, result) => {
      if (err) throw err;
      console.log(result);
    }
  );
};

modules.exports = con;
