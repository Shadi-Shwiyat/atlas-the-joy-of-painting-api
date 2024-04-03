// An express app that serves as the
// api for servering data queries from
// the MySQL database

const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint for filtering episodes
app.get('/episodes', (req, res) => {
    // Extract query parameters from the request
    const { month, subjects, colors, matchAllFilters } = req.query;
    const queryParams = [];
    let sql = '';

    if (matchAllFilters && matchAllFilters.toLowerCase() === 'true') {
        // Match all filters (AND condition)
        sql = 'SELECT DISTINCT e.* FROM episodes e JOIN episodes_colors ec ON e.painting_index = ec.painting_index JOIN colors c ON ec.colors_id = c.colors_id JOIN episode_subjects es ON e.painting_index = es.painting_index JOIN subjects s ON es.subject_id = s.subject_id WHERE ';

        if (month) {
            sql += `MONTH(date) = ${month}`;
            queryParams.push(month);
        }
        if (subjects) {
            const subjectList = subjects.split(',').map(subject => `'${subject}'`).join(',');
            sql += ` AND s.subject_name IN (${subjectList})`;
        }
        if (colors) {
            const colorList = colors.split(',').map(color => `'${color}'`).join(',');
            sql += ` AND c.color_name IN (${colorList})`;
        }
    } else {
        // Construct SQL query based on the provided filters
        sql = 'SELECT * FROM episodes WHERE 1=1';

        if (month) {
            sql += ` AND MONTH(date) = ${month}`;
            queryParams.push(month);
        }
        if (subjects) {
            const subjectList = subjects.split(',').map(subject => `'${subject}'`).join(',');
            sql += ` AND painting_index IN (SELECT painting_index FROM episode_subjects WHERE subject_id IN (SELECT subject_id FROM subjects WHERE subject_name IN (${subjectList})))`;
        }
        if (colors) {
            const colorList = colors.split(',').map(color => `'${color}'`).join(',');
            sql += ` AND painting_index IN (SELECT painting_index FROM episodes_colors WHERE colors_id IN (SELECT colors_id FROM colors WHERE color_name IN (${colorList})))`;
        }

    }

    console.log(sql);

    // Execute the SQL query
    db.query(sql, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching episodes:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        // console.log(queryParams);
        res.json(results);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
