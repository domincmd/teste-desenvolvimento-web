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
    for (let i = 0; i < data.length(); i++) {
        if (data[i].name.toLowerCase() == pokemon.toLowerCase()) {
            const discoveredPokemon = data[i]
            console.log(discoveredPokemon)
            return discoveredPokemon;
        }
    }

    return null;
}




// Route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.post('/search', (req, res) => {
    const body = req.body

    const pokemon = body.pokemon
    
    getPokemonData(pokemon)

    res.sendFile(path.join(__dirname, 'html', 'index.html')); //send it with the frontend info after the processing
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
