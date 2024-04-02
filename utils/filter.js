// Parses through datasets,
// filters data with regex and
// saves it to a new file

const fs = require('fs');

// Read the text file
fs.readFile('datasets/episode_dates', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Split the data into individual lines
  const lines = data.split('\n');

  // Parse each line and extract relevant information
  const parsedData = lines.map(line => {
    const match = line.match(/"([^"]+)" \(([^)]+)\)/);
    if (match) {
      return {
        title: match[1],
        date: match[2]
      };
    } else {
      console.error('Error parsing line:', line);
      return null;
    }
  }).filter(Boolean); // Filter out any null entries

  // Write the parsed data to a JSON file
  fs.writeFile('datasets/filtered_data.json', JSON.stringify(parsedData, null, 2), err => {
    if (err) {
      console.error('Error writing to file:', err);
      return;
    }
    console.log('Data parsed and saved to parsed_data.json');
  });
});