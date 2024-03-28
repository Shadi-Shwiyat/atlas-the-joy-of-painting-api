// Creates a connection to a
// MySQL server and exports it
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: "raz",
    password: "razpassword",
    database: "the_joy_of_painting",
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connection Success! :)");
});

module.exports = connection;
