const fs = require('fs');
const db = require('./db');

// Function to load data from JSON file and insert into database
function loadData() {
    // Read the JSON file
    fs.readFile('datasets/filtered_data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return;
        }

        // Parse JSON data
        const episodes = JSON.parse(data);

        // Insert episodes data into 'episodes' table
        episodes.forEach(episode => {
            const {
                title,
                painting_index,
                date,
                season,
                episode: episodeNum,
                img_src,
                youtube_src,
                subjects,
                colors,
                color_hex,
            } = episode;

            const episodeData = {
                painting_index,
                title,
                date,
                season,
                episode: episodeNum,
                img_src,
                youtube_src,
            };

            db.query('INSERT INTO episodes SET ?', episodeData, (err, result) => {
                if (err) {
                    console.error('Error inserting episode:', err);
                    return;
                }
                console.log('Inserted episode:', result.insertId);

                // Insert colors into 'colors' table and map them to episode
                colors.forEach((color, index) => {
                    const colorData = {
                        color_name: color,
                        hex_value: color_hex[index],
                    };

                    // Check if color exists in 'colors' table
                    db.query('SELECT * FROM colors WHERE color_name = ?', color, (err, rows) => {
                        if (err) {
                            console.error('Error checking color:', err);
                            return;
                        }

                        if (rows.length === 0) {
                            // If color does not exist, insert into 'colors' table
                            db.query('INSERT INTO colors SET ?', colorData, (err, result) => {
                                if (err) {
                                    console.error('Error inserting color:', err);
                                    return;
                                }
                                console.log('Inserted color:', result.insertId);

                                // Insert mapping into 'episodes_colors' table
                                const episodeColorData = {
                                    painting_index,
                                    colors_id: result.insertId,
                                    num_colors: colors.length,
                                };

                                db.query('INSERT INTO episodes_colors SET ?', episodeColorData, (err, result) => {
                                    if (err) {
                                        console.error('Error inserting episode-color mapping:', err);
                                        return;
                                    }
                                    console.log('Inserted episode-color mapping:', result.insertId);
                                });
                            });
                        } else {
                            // If color already exists, use existing color_id
                            const episodeColorData = {
                                painting_index,
                                colors_id: rows[0].colors_id,
                                num_colors: colors.length,
                            };

                            db.query('INSERT INTO episodes_colors SET ?', episodeColorData, (err, result) => {
                                if (err) {
                                    console.error('Error inserting episode-color mapping:', err);
                                    return;
                                }
                                console.log('Inserted episode-color mapping:', result.insertId);
                            });
                        }
                    });
                });

                // Insert subjects into 'subjects' table and map them to episode
                subjects.forEach(subject => {
                    db.query('SELECT * FROM subjects WHERE subject_name = ?', subject, (err, rows) => {
                        if (err) {
                            console.error('Error checking subject:', err);
                            return;
                        }

                        if (rows.length === 0) {
                            // If subject does not exist, insert into 'subjects' table
                            db.query('INSERT INTO subjects SET ?', { subject_name: subject }, (err, result) => {
                                if (err) {
                                    console.error('Error inserting subject:', err);
                                    return;
                                }
                                console.log('Inserted subject:', result.insertId);

                                // Insert mapping into 'episode_subjects' table
                                const episodeSubjectData = {
                                    painting_index,
                                    subject_id: result.insertId,
                                };

                                db.query('INSERT INTO episode_subjects SET ?', episodeSubjectData, (err, result) => {
                                    if (err) {
                                        console.error('Error inserting episode-subject mapping:', err);
                                        return;
                                    }
                                    console.log('Inserted episode-subject mapping:', result.insertId);
                                });
                            });
                        } else {
                            // If subject already exists, use existing subject_id
                            const episodeSubjectData = {
                                painting_index,
                                subject_id: rows[0].subject_id,
                            };

                            db.query('INSERT INTO episode_subjects SET ?', episodeSubjectData, (err, result) => {
                                if (err) {
                                    console.error('Error inserting episode-subject mapping:', err);
                                    return;
                                }
                                console.log('Inserted episode-subject mapping:', result.insertId);
                            });
                        }
                    });
                });
            });
        });
    });
}

loadData();
