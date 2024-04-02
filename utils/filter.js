// Parses through datasets,
// filters data with regex and
// saves it to a new file

const fs = require('fs');
const { parse } = require('csv-parse');

// Read the text file containing episode dates
fs.readFile('datasets/episode_dates', 'utf8', (err, txtData) => {
  if (err) {
    console.error('Error reading text file:', err);
    return;
  }
  
  // Split the text data into individual lines
  const txtLines = txtData.split('\n').filter(line => line.trim()); // Filter out empty lines
  
  // Read the CSV file containing subject matter
  fs.readFile('datasets/subject_matter.csv', 'utf8', (err, csvSubjectData) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return;
    }

    // Parse the subject matter CSV data using csv-parse
    parse(csvSubjectData, { columns: true }, (err, csvSubjectRecords) => {
      if (err) {
        console.error('Error parsing CSV data:', err);
        return;
      }

      // Read the CSV file containing color information
      fs.readFile('datasets/colors_used.csv', 'utf8', (err, csvColorData) => {
        if (err) {
          console.error('Error reading color CSV file:', err);
          return;
        }

        // Parse the color info CSV data using csv-parse
        parse(csvColorData, { columns: true }, (err, csvColorRecords) => {
          if (err) {
            console.error('Error parsing color CSV data:', err);
            return;
          }

          // Initialize an array to hold updated JSON objects
          const updatedJsonObjects = [];

          // Determine the number of records to process based on the minimum between the text and CSV records
          const numRecords = Math.min(txtLines.length, csvSubjectRecords.length, csvColorRecords.length);

          // Loop through each record
          for (let index = 0; index < numRecords; index++) {
            const txtLine = txtLines[index];
            const subjectRecord = csvSubjectRecords[index];
            const colorRecord = csvColorRecords[index];

            // Extract the episode and subjects from the subject matter CSV record
            const episode = subjectRecord['EPISODE'];
            const subjects = Object.keys(subjectRecord).filter(key => key !== 'EPISODE' && subjectRecord[key] === '1');

            // Extract color information from the color info CSV record
            const { painting_index, img_src, num_colors, youtube_src, colors, color_hex } = colorRecord;
            const colorList = colors.replace(/\\r\\n/g, '').slice(1, -1).split(',').map(color => color.trim().slice(1, -1));
            const hexList = color_hex.replace(/\\r\\n/g, '').slice(1, -1).split(',').map(hex => hex.trim().slice(1, -1));

            // Construct the updated JSON object
            const updatedObject = {
              title: txtLine.match(/"([^"]+)"/)[1], // Extract title from text file
              date: txtLine.match(/\(([^)]+)\)/)[1], // Extract date from text file
              episode: episode,
              subjects: subjects,
              painting_index: painting_index,
              img_src: img_src,
              num_colors: num_colors,
              youtube_src: youtube_src,
              colors: colorList,
              color_hex: hexList
            };

            // Push the updated object to the array
            updatedJsonObjects.push(updatedObject);
          }

          // Write the updated JSON data to a file
          fs.writeFile('datasets/filtered_data.json', JSON.stringify(updatedJsonObjects, null, 2), err => {
            if (err) {
              console.error('Error writing updated data to file:', err);
              return;
            }
            console.log('Updated data saved to filtered_data.json');
          });
        });
      });
    });
  });
});