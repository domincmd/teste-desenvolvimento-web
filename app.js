// Required libraries
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const fs = require('fs')

// Declare constants
const port = 3000;
const jsonData = fs.readFileSync(path.join(__dirname, "/database.json"), 'utf-8'); //get the json data

// Parsing JSON data to JavaScript object
const data = JSON.parse(jsonData);

// Initialize the express app
const app = express();

// Middleware to serve static files from the /static directory
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.json())

//functions before the actual get and post requests

function getPokemonData(pokemon) {
    
    for (let i = 0; i < data.length; i++) {
        if (data[i]["Name"].toLowerCase() === pokemon.toLowerCase()) {
            const discoveredPokemon = data[i];

            return discoveredPokemon;
        }
    }

    return null;
}





// Route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.post("/filters", (req, res) => {
    
    const reference = data[1] //get a reference pokemon to get the possible filters

    const filters = Object.keys(reference).filter(key => reference[key] === 0 || reference[key] === 1)

    //console.log(filters)

    res.json(filters)
});

app.post('/search', (req, res) => {
    const body = req.body;
    const pokemon = body.pokemon;  // Form input name is "pokemon"
    const discoveredPokemon = getPokemonData(pokemon);

    // Read the HTML file and dynamically inject the Pokémon data
    fs.readFile(path.join(__dirname, 'html', 'index.html'), 'utf8', (err, content) => {
        if (err) {
            res.status(500).send('Error reading the HTML file');
            return;
        }

        if (discoveredPokemon) {
            res.json(discoveredPokemon);
        } else {
            res.json({ Name: 'Pokémon not found' });
        }
    });
});

app.post("/search-filtered", (req, res) => {
    const filters = req.body.filters;

    console.log(filters); // Logs an array of things like "Spawns", "Regional", etc.

    let items = [];

    data.forEach((datai) => {
        let includeItem = true;

        // Loop through the filters and check if datai meets the conditions
        filters.forEach((filter) => {
            if (!datai[filter] || datai[filter] === 0) {
                includeItem = false;
            }
        });

        if (includeItem) {
            items.push(datai);
        }
    });

    res.json({ answer: items });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
