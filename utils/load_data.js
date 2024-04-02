const fs = require('fs');
const db = require('./db');

// Function to load data from JSON file and insert into database
function loadData(callback) {
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
              num_colors,
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
              num_colors,
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

                  // Use INSERT IGNORE to handle duplicate colors
                  db.query('INSERT IGNORE INTO colors SET ?', colorData, (err, result) => {
                      if (err) {
                          console.error('Error inserting color:', err);
                          return;
                      }
                      if (result.affectedRows === 1) {
                          console.log('Inserted color:', result.insertId);
                      } else {
                          console.log('Color already exists:', colorData.color_name);
                      }

                      // Retrieve color_id
                      db.query('SELECT colors_id FROM colors WHERE color_name = ?', colorData.color_name, (err, rows) => {
                          if (err) {
                              console.error('Error retrieving color_id:', err);
                              return;
                          }

                          // Insert mapping into 'episodes_colors' table
                          const episodeColorData = {
                              painting_index,
                              colors_id: rows[0].colors_id,
                          };

                          db.query('INSERT INTO episodes_colors SET ?', episodeColorData, (err, result) => {
                              if (err) {
                                  console.error('Error inserting episode-color mapping:', err);
                                  return;
                              }
                              console.log('Inserted episode-color mapping:', result.insertId);
                          });
                      });
                  });
              });

              // Insert subjects into 'subjects' table and map them to episode
              subjects.forEach(subject => {
                  // Use INSERT ... ON DUPLICATE KEY UPDATE to handle duplicate subjects
                  db.query('INSERT INTO subjects (subject_name) VALUES (?) ON DUPLICATE KEY UPDATE subject_name = ?', [subject, subject], (err, result) => {
                      if (err) {
                          console.error('Error inserting subject:', err);
                          return;
                      }
                      if (result.affectedRows === 1) {
                          console.log('Inserted subject:', result.insertId);
                      } else {
                          console.log('Subject already exists:', subject);
                      }

                      // Retrieve subject_id
                      db.query('SELECT subject_id FROM subjects WHERE subject_name = ?', subject, (err, rows) => {
                          if (err) {
                              console.error('Error retrieving subject_id:', err);
                              return;
                          }

                          // Insert mapping into 'episode_subjects' table
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
                      });
                  });
              });
          });
      });
  });
}

loadData();
