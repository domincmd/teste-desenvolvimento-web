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
    
    const reference = data[0] //get a reference pokemon to get the possible filters

    const filters = Object.keys(reference).filter(key => reference[key] === "bool")

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
    const filters = req.body.filters; // Now an array of objects, e.g., [ { 'Cross Gen': false }, { Spawns: true } ]
    const name = req.body.name;

    console.log(filters); // Logs an array of objects like { 'Cross Gen': false }

    let items = [];

    data.forEach((datai) => { // for each element in our data (an array with dicts)
        let includeItem = true;

        filters.forEach((filterObj) => { 
            // extract key and value from the filter object
            const [filterKey, filterValueUnprocessed] = Object.entries(filterObj)[0]; //Shiny, true

            let filterValue = 0

            if (filterValueUnprocessed) {
                filterValue = 1
            }
        

            // If the item doesn't have the filterKey or its value doesn't match the filterValue, exclude it
            if (!datai.hasOwnProperty(filterKey) || datai[filterKey] !== filterValue) {
                includeItem = false;
            }
        });

        // Maintain this condition for matching names
        if (!datai["Name"].includes(name)) {
            includeItem = false;
        }

        // If the item passes all filters, add it to the result
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

    res.json({result: true, status: "completed successfully"})
});

app.post("/search/add", (req, res) => {
    const toAdd = req.body;

    for (let i = 0; i < data.length; i++) {
        if (toAdd.Name == data[i].Name) {
            res.json({result: false, status: "this already exists!"})
            return;
        }
    }

    data.splice(toAdd.Row-1, 0, toAdd)

    for (let i = toAdd.Row; i < data.length; i++) {  //start from the removed index
        if (data[i].Row != "int") {
            data[i].Row += 1;
        }
        
    }

    console.log(data.slice(0, 5))

    res.json({result: true, status: "completed successfully"}) //send the positive result till I find a way to send the negative
})

app.post("/view/data-request", (req, res) => {
    res.json(data)
});


//Return the JS files, now contained in the backend!
app.get("/js/search.js", (req, res) => {
    res.sendFile(path.join(__dirname, "js", "search.js"))
})
app.get("/js/view.js", (req, res) => {
    res.sendFile(path.join(__dirname, "js", "view.js"))
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "html", "index.html"));
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

