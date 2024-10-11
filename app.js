// Required libraries
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const fs = require('fs')

// Declare constants
const port = 5000;
const jsonData = fs.readFileSync(path.join(__dirname, "/database.json"), 'utf-8'); //get the json data
const data = JSON.parse(jsonData);

// Initialize the express app
const app = express();

// Middleware to serve static files from the /static directory
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.json())

//functions before the actual get and post requests

function getPokemonData(pokemon, type) {
    if (type == "str") {
        for (let i = 0; i < data.length; i++) {
            if (data[i]["Name"].toLowerCase() === pokemon.toLowerCase() ) {
                const discoveredPokemon = data[i];
    
                return discoveredPokemon;
            }
        }
    }else if (type == "int") {
        for (let i = 0; i < data.length; i++) {
            if (data[i]["Row"] == pokemon ) {
                const discoveredPokemon = data[i];
    
                return discoveredPokemon;
            }
        }
    }else {
        return null
    }
    

}



app.get("/view", (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'view.html'))
})

// Route to serve the HTML file
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'search.html'));
});

app.post("/search/filters", (req, res) => {
    
    const reference = data[1] //get a reference pokemon to get the possible filters

    const filters = Object.keys(reference).filter(key => reference[key] === 0 || reference[key] === 1)

    //console.log(filters)

    res.json(filters)
});

app.post('/search/search', (req, res) => {
    const body = req.body;
    const pokemon = body.pokemon;  // Form input name is "pokemon"
    const discoveredPokemon = getPokemonData(pokemon, body.type);

    // Read the HTML file and dynamically inject the Pokémon data
    fs.readFile(path.join(__dirname, 'html', 'search.html'), 'utf8', (err, content) => {
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

app.post("/search/search-filtered", (req, res) => {
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

app.post("/search/update", (req, res) => {

    fs.writeFile(path.join(__dirname, "database.json"), JSON.stringify(data, null, 2), (err) => {
        if (err) {
            res.json({result: false, status: err})
            return;
        }
        res.json({result: true, status: "completed successfully"})
    });

    
})

app.post("/search/remove", (req, res) => {
    const pokemonI = req.body.pokemon;

    // Check if the index is valid
    if (pokemonI <= 0 || pokemonI > data.length) {
        return res.status(400).send("Invalid pokemon index");
    }

    // Remove the specific item at index (pokemonI - 1)
    data.splice(pokemonI - 1, 1);  // Removing one element at pokemonI - 1

    // Update the row index for the remaining elements
    for (let i = pokemonI - 1; i < data.length; i++) {  // Start from the removed index
        data[i].Row -= 1;
    }

    res.send("Pokemon removed successfully");
});

app.post("/search/add", (req, res) => {
    const toAdd = req.body;

    data.splice(toAdd.Row-1, 0, toAdd)

    for (let i = toAdd.Row; i < data.length; i++) {  //start from the removed index
        data[i].Row += 1;
    }

    console.log(data.slice(0, 5))

    res.json({result: true, status: "completed successfully"}) //send the positive result till I find a way to send the negative
})

app.post("/view/data-request", (req, res) => {
    res.json(data)
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

