// Script that reads json data
// from datasets/filtered_data.json
// and loads data into the_joy_of_painting
// MySQL database
const fs = require('fs');
const db = require('./db');

// Read the JSON file containing the clean data
fs.readFile('datasets/filtered_data.json', 'utf8', (err, jsonData) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }

  // Parse the JSON data
  const episodes = JSON.parse(jsonData);

  // Insert data into the database
  episodes.forEach(episode => {
    const {
      title,
      date,
      episode: episodeNumber,
      subjects,
      painting_index,
      img_src,
      num_colors,
      youtube_src,
      colors,
      color_hex
    } = episode;

    // Insert episode information into 'episodes' table
    const episodeQuery = `
      INSERT INTO episodes (painting_index, title, date, episode, img_src, youtube_src)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const episodeValues = [painting_index, title, date, episodeNumber, img_src, youtube_src];

    db.query(episodeQuery, episodeValues, (err, result) => {
      if (err) {
        console.error('Error inserting episode:', err);
        return;
      }
      console.log('Inserted episode:', result.insertId);

      // Insert colors information into 'colors' table
      colors.forEach((color, index) => {
        const colorQuery = `
          INSERT INTO colors (colors_id, color_name, hex_value)
          VALUES (?, ?, ?)
        `;
        const colorValues = [index + 1, color, color_hex[index]];

        db.query(colorQuery, colorValues, (err, result) => {
          if (err) {
            console.error('Error inserting color:', err);
            return;
          }
          console.log('Inserted color:', result.insertId);
        });

        // Insert episode-color relationship into 'episodes_colors' table
        const episodeColorQuery = `
          INSERT INTO episodes_colors (painting_index, colors_id, num_colors)
          VALUES (?, ?, ?)
        `;
        const episodeColorValues = [painting_index, index + 1, num_colors];

        db.query(episodeColorQuery, episodeColorValues, (err, result) => {
          if (err) {
            console.error('Error inserting episode-color relationship:', err);
            return;
          }
          console.log('Inserted episode-color relationship:', result.insertId);
        });
      });

      // Insert subjects information into 'subjects' table
      subjects.forEach((subject, index) => {
        const subjectQuery = `
          INSERT INTO subjects (subject_id, subject_name)
          VALUES (?, ?)
        `;
        const subjectValues = [index + 1, subject];

        db.query(subjectQuery, subjectValues, (err, result) => {
          if (err) {
            console.error('Error inserting subject:', err);
            return;
          }
          console.log('Inserted subject:', result.insertId);
        });

        // Insert episode-subject relationship into 'episode_subjects' table
        const episodeSubjectQuery = `
          INSERT INTO episode_subjects (painting_index, subject_id)
          VALUES (?, ?)
        `;
        const episodeSubjectValues = [painting_index, index + 1];

        db.query(episodeSubjectQuery, episodeSubjectValues, (err, result) => {
          if (err) {
            console.error('Error inserting episode-subject relationship:', err);
            return;
          }
          console.log('Inserted episode-subject relationship:', result.insertId);
        });
      });
    });
  });
});