const searchFilterContainer = document.querySelector(".search-filter-container")
const viewContainer = document.querySelector(".view-container")
const additionContainer = document.querySelector(".addition-container")


function fetchData(url, method, body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    return fetch(url, options)
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
        });
}

function decodeAddition() {
    const properties = additionContainer.querySelectorAll(".prompt-addition")
    let finalDict = {}

    properties.forEach(property => { 
        if (property.type == "text") {
            finalDict[property.classList.item(1).replace(/-/g, " ")] = property.value
        } else if (property.type == "number") {
            if (property.value == "") {
                finalDict[property.classList.item(1).replace(/-/g, " ")] = 0
            }else{
                finalDict[property.classList.item(1).replace(/-/g, " ")] = parseInt(property.value)
            }
            
        } else if (property.type == "checkbox") {
            finalDict[property.classList.item(1).replace(/-/g, " ")] = property.checked ? 1 : 0; // This line is sufficient
        }
    })

    return finalDict
}


// Refactored promptAddition
function promptAddition() {
    additionContainer.style.display = "block";

    fetchData('/view/data-request', 'POST')
        .then(data => {
            Object.keys(data[0]).forEach(key => {
                const createdLabel = document.createElement("span");
                createdLabel.textContent = `${key}`; // Display key and value

                const createdInput = document.createElement("input")
                if (data[0][key] == "text") {
                    createdInput.type = "text"
                }else if (data[0][key] == "int"){
                    createdInput.type = "number" //row is got to be a number so that this wokrs properly!
                }else if (data[0][key] == "bool") {
                    createdInput.type = "checkbox"
                }
                
                createdInput.classList.add("prompt-addition")
                createdInput.classList.add(key.replace(/ /g, "-"))

                additionContainer.appendChild(createdLabel)
                additionContainer.appendChild(createdInput)
                additionContainer.appendChild(document.createElement("br"))
            });    
            
            const submitButton = document.createElement("button")

            submitButton.textContent = "Submit"
            submitButton.addEventListener("click", e => {
                const toAdd = decodeAddition()

                queryAddition(toAdd)

                const properties = additionContainer.querySelectorAll(".prompt-addition")

                properties.forEach(property => { 
                    property.value = "";
                })

                additionContainer.display = "none";
            })

            additionContainer.appendChild(submitButton)
        });
}

// Refactored queryAddition
function queryAddition(toAdd) {
    fetchData('/search/add', 'POST', toAdd)
        .then(data => {
            if (data.result != true) {
                alert(data.status)
            } else {
                alert("successfully updated the database!")
            }
        });
}


function queryUpdate() {
    fetchData('/search/update', 'POST')
        .then(data => {
            if (data.result != true) {
                alert(data.status)
            } else {
                alert("successfully updated the database!")
            }
        });
}

// Refactored queryRemoval
function queryRemoval() {
    if (viewContainer.querySelector(".card")) {
        const pokemonI = document.querySelector(".card").querySelector(".row").innerHTML.slice(5)
        fetchData('/search/remove', 'POST', { pokemon: pokemonI })
            .then(data => {
                if (data.result != true) {
                    alert(data.status)
                } else {
                    alert("successfully removed the item")
                }
            });
    } else {
        alert("select a card before removing it!")
        return null;
    }
}


function displayFilterResults(filters) {
    const resultContainer = document.createElement("div")
    resultContainer.classList.add("filter-results")


    filters.answer.forEach(i => {
        const iDisplay = document.createElement("span")
        const br = document.createElement("br")
        iDisplay.textContent = i.Name;
        resultContainer.appendChild(iDisplay)
        resultContainer.appendChild(br)
    })

    return resultContainer;
}

function getFiltersFrontend() {
    const filterDiv = document.querySelector(".filter-container");

    let filters = []

    for (let i = 0; i < filterDiv.childNodes.length-1; i++) {
        const currentDiv = filterDiv.childNodes[i];

        if (currentDiv.nodeType === 1) { // Ensure it's an element node

            if (currentDiv.tagName.toLowerCase() !== "div") {
                console.log("Non-div element found, skipping...");
                continue;
            }
            const filter = currentDiv.querySelector("span").textContent;
            const filterInclude = currentDiv.querySelector(".include").checked;
            const filterState = currentDiv.querySelector(".state").checked;

            

            if (filterInclude) {
                filters.push({[filter]: filterState})
            }

            
        }
    }

    return filters;
}


function displayFilters(filters) {
    const filtersDiv = document.createElement("div")
    filtersDiv.classList.add("filter-container")

    const labelFilterNameInput = document.createElement("span")
    labelFilterNameInput.textContent = "Name: "
    filtersDiv.appendChild(labelFilterNameInput) 

    const filterNameInput = document.createElement("input")
    filterNameInput.type = "text";
    filterNameInput.classList.add("filter-name-input")
    filtersDiv.appendChild(filterNameInput)


    const filterButton = document.createElement("button");
    filterButton.textContent = "Filter";
    filterButton.addEventListener("click", e => {
        const filters = getFiltersFrontend()

        searchFiltered(filters, document.querySelector(".filter-name-input").value)
        
    });
    

    for (let i = 0; i < filters.length; i++) {
        const currentDiv = document.createElement("div")
        currentDiv.classList.add("filter")
        currentDiv.classList.add(i)

        const currentIncludeInput = document.createElement("input")
        currentIncludeInput.type = "checkbox";
        currentIncludeInput.classList.add("include")
        currentDiv.appendChild(currentIncludeInput)

        const currentStateInput = document.createElement("input")
        currentStateInput.type = "checkbox";
        currentStateInput.classList.add("state")
        currentDiv.appendChild(currentStateInput)

        const currentInputText = document.createElement("span")
        currentInputText.textContent = filters[i]
        currentDiv.appendChild(currentInputText)

        filtersDiv.appendChild(currentDiv)
    }
    
    filtersDiv.appendChild(filterButton)

    return filtersDiv;
}


// Function to display data
function displayData(data) {
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card");

    // Loop through the object keys and values
    Object.keys(data).forEach(key => {
        const createdElement = document.createElement("span");
        createdElement.textContent = `${key}: ${data[key]}`; // Display key and value
        createdElement.classList.add(key.toLowerCase().replace(/ /g, "-"));
        cardContainer.appendChild(createdElement);
    });

    console.log(cardContainer)

    return cardContainer;
}

function getFiltersBackend() {
    fetchData('/search/filters', 'POST')
        .then(data => {
            searchFilterContainer.appendChild(displayFilters(data))
        });
}

// Function to send data
function sendData(type) {
    const pokemon = document.getElementById('name-of-pokemon').value;

    // Validate if input is not empty
    if (!pokemon) {
        alert("Please enter a Pokémon name");
        return;
    }

    fetchData('/search/search', 'POST', { pokemon: pokemon, type: type })
        .then(data => {
            const viewContainer = document.querySelector(".view-container");
            viewContainer.innerHTML = ""; // Clear previous content
            console.log(data.Name)
            // Append the new card
            viewContainer.appendChild(displayData(data));
        });

}

function searchFiltered(presentFilters, filterName) {
    fetchData('/search/search-filtered', 'POST', { filters: presentFilters, name: filterName })
        .then(data => {
            console.log(data)
            const filtersDiv = displayFilterResults(data)

            if (searchFilterContainer.querySelector(".filter-results")) {
                searchFilterContainer.removeChild(searchFilterContainer.querySelector(".filter-results"))
            }

            searchFilterContainer.appendChild(filtersDiv)
        });
}

//call functions

getFiltersBackend()