window.addEventListener('DOMContentLoaded', getUsers);

function getUsers() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://138.2.151.211:3000/getresults', true);
    xhr.onload = function () {
        var results = JSON.parse(xhr.responseText);
        renderResults(results);
    };
    xhr.send();
}

function renderResults(results) {
    // Get the table body element
    var tableBody = document.getElementById("resultsTableBody");

    // Clear existing rows from the table
    tableBody.innerHTML = "";

    // Only create table rows if there are results present
    if (results.length > 0) {
        // Loop through the results and create table rows dynamically
        for (var i = 0; i < results.length; i++) {
            var result = results[i];

            // Create a new row
            var row = document.createElement("tr");

            // Create ID cell
            var idCell = document.createElement("td");
            idCell.textContent = result.userID;

            // Create username cell
            var usernameCell = document.createElement("td");
            // In this example, the username is not provided in the response, so we can leave it blank
            usernameCell.textContent = result.username;

            // Create questions answered cell
            var questionsCell = document.createElement("td");
            questionsCell.textContent = result.questions_answered;

            // Create total attempts cell
            var attemptsCell = document.createElement("td");
            attemptsCell.textContent = result.attempts;

            // Append cells to the row
            row.appendChild(idCell);
            row.appendChild(usernameCell);
            row.appendChild(questionsCell);
            row.appendChild(attemptsCell);

            // Append the row to the table body
            tableBody.appendChild(row);
        }
    } else {
        // Handle case when there are no results
        var emptyRow = document.createElement("tr");
        var emptyCell = document.createElement("td");
        emptyCell.setAttribute("colspan", "4");
        emptyCell.textContent = "Ingen resultater fundet.";
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
    }
}
