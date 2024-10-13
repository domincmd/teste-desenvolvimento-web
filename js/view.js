function displayData(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return '<p>No data available</p>';
    }

    // Extract the table headers from the first object keys
    const headers = Object.keys(data[0]);

    // Start building the HTML table
    let table = '<table border="1"><thead><tr>';
    
    // Generate headers row
    headers.forEach(header => {
        table += `<th>${header}</th>`;
    });
    table += '</tr></thead><tbody>';

    // Generate rows for each object in the array
    data.forEach(item => {
        table += '<tr>';
        headers.forEach(header => {
        table += `<td>${item[header]}</td>`;
        });
        table += '</tr>';
    });

    table += '</tbody></table>';
    return table;
}

function dataRequest() {
    fetch('/view/data-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        //body: JSON.stringify({ filters: presentFilters }), // Send name as JSON
    })
    .then(response => response.json())
    .then(data => {
        // Clear the view-container before displaying new data
        const div = document.createElement("div")
        console.log(displayData(data))
        div.innerHTML = displayData(data)

        document.querySelector("body").appendChild(div)
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

const data = dataRequest()