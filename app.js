//add the required libraries
const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const path = require('path')

//declare some constants
const port = 3000


//declare the express app
const app = express();


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/html/index.html"))
});


app.listen(port, () => {
    console.log("listening on port " + port)
})