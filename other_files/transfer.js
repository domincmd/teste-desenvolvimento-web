const xlsx = require('xlsx');
const fs = require('fs');
const readline = require('readline');
const { types } = require('util');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
}

async function askForTypeOfValues(data) {
    let typesDict = {};
    const aliasesDict = {
        "i": "int",
        "b": "bool",
        "s": "str"
    }

    for (let key of Object.keys(data[0])) { // Use data[0] as a sample
        let valid = false;

        // Reprompt until valid answer is received
        while (!valid) {
            const answer = await askQuestion(`Is the key "${key}" supposed to be an? ('int', 'bool', 'str' supported): `);
            if (["int", "bool", "str"].includes(answer)) {
                typesDict[key] = answer;
                valid = true;
            }else if (["i", "b", "s".includes(answer)]) {
                typesDict[key] = aliasesDict[answer]
                valid = true
            } 
            else {
                console.log("Not a valid option, please try again.");
            }
        }
    }

    rl.close(); // Close the readline interface when done
    return typesDict;
}

// Read the Excel file
const workbook = xlsx.readFile('./Pokemon Go.xlsx');

// Access the first sheet by its name
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert the sheet to JSON
let jsonData = xlsx.utils.sheet_to_json(sheet);

// Ask for type of values and handle the result
askForTypeOfValues(jsonData).then((typesDict) => {
    console.log("User-defined types:", typesDict);

    const trueJsonData = jsonData.splice(0, 0, typesDict)

    // Write the JSON data to a file
    fs.writeFile('database.json', JSON.stringify(jsonData, null, 2), (err) => {
        if (err) console.log(err);
        else console.log('JSON file has been written!');
    });
});
