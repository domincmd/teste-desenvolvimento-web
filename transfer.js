//========================
//ABOUT THIS FILE
//========================
//this is the file that transfers the xlsx onto json, can be used if more data needs to be transfered to the new database type

const xlsx = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = xlsx.readFile('./Pokemon Go.xlsx');

// Access the first sheet by its name (you can also specify other sheets if needed)
const sheetName = workbook.SheetNames[0]; // This gets the first sheet name
const sheet = workbook.Sheets[sheetName];

// Convert the sheet to JSON
const jsonData = xlsx.utils.sheet_to_json(sheet);

// Write the JSON data to a file
fs.writeFile('database.json', JSON.stringify(jsonData, null, 2), (err) => {
    if (err) console.log(err);
    else console.log('JSON file has been written!');
});
