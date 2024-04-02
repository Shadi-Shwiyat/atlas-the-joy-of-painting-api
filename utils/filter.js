// Parses through datasets,
// filters data with regex and
// saves it to a new file

const fs = require('fs');
const { parse } = require('csv-parse');

// Read the text file
fs.readFile('datasets/episode_dates', 'utf8', (err, txtData) => {
  if (err) {
      console.error('Error reading text file:', err);
      return;
  }
  
  // Split the text data into individual lines
  const txtLines = txtData.split('\n').filter(line => line.trim()); // Filter out empty lines
  
  // Read the CSV file
  fs.readFile('datasets/subject_matter.csv', 'utf8', (err, csvData) => {
      if (err) {
      console.error('Error reading CSV file:', err);
      return;
      }
  
      // Parse the CSV data using csv-parse
      parse(csvData, { columns: true }, (err, csvRecords) => {
      if (err) {
          console.error('Error parsing CSV data:', err);
          return;
      }
  
      // Initialize an array to hold updated JSON objects
      const updatedJsonObjects = [];
  
      // Determine the number of records to process based on the minimum between the text and CSV records
      const numRecords = Math.min(txtLines.length, csvRecords.length);
  
      // Loop through each record in the CSV data
      for (let index = 0; index < numRecords; index++) {
          const txtLine = txtLines[index];
          const csvRecord = csvRecords[index];
  
          // Extract the episode and subjects from the CSV record
          const episode = csvRecord['EPISODE'];
          const subjects = Object.keys(csvRecord).filter(key => key !== 'EPISODE' && csvRecord[key] === '1');
  
          // Construct the updated JSON object
          const updatedObject = {
          title: txtLine.match(/"([^"]+)"/)[1], // Extract title from text file
          date: txtLine.match(/\(([^)]+)\)/)[1], // Extract date from text file
          episode: episode,
          subjects: subjects
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
          console.log('Updated data saved to updated_data.json');
      });
    });
  });
});