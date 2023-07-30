window.addEventListener('DOMContentLoaded', getUsers);

function getUsers() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:3000/getusers', true);
  xhr.onload = function() {
      var users = JSON.parse(xhr.responseText);
      renderUsers(users);
  };
  xhr.send();
}

function renderUsers(users) {
  // Get the table body element
  var tableBody = document.getElementById("userTableBody");

  // Clear existing rows from the table
  tableBody.innerHTML = "";

  // Only create table rows if there are users present
  if (users.length > 0) {
    // Loop through the users and create table rows dynamically
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      if (user.admin) continue; // Skip admin user (we don't want to delete the admin user)

      // Create a new row
      var row = document.createElement("tr");

      // Create ID cell
      var idCell = document.createElement("td");
      idCell.textContent = user.id;

      // Create username cell
      var usernameCell = document.createElement("td");
      usernameCell.textContent = user.username;

      // Create password cell
      var passwordCell = document.createElement("td");
      passwordCell.textContent = user.password;

      // Create action cell with delete button
      var actionCell = document.createElement("td");
      var deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      // The button calls the deleteUser function when clicked and sends the user id to the server
      deleteButton.setAttribute("onclick", "deleteUser(" + user.id + ")");
      actionCell.appendChild(deleteButton);

      // Append cells to the row
      row.appendChild(idCell);
      row.appendChild(usernameCell);
      row.appendChild(passwordCell);
      row.appendChild(actionCell);

      // Append the row to the table body
      tableBody.appendChild(row);
    }
  } else {
    // Handle case when there are no users
    var emptyRow = document.createElement("tr");
    var emptyCell = document.createElement("td");
    emptyCell.setAttribute("colspan", "4");
    emptyCell.textContent = "Ingen brugere fundet.";
    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
  }
}


function deleteUser(userId) {
  // Create a payload object with the userId
  var payload = {
    userId: userId
  };

  // Convert the payload to JSON
  var payloadJSON = JSON.stringify(payload);

  // Send the HTTP request to delete the user based on the id found in its HTML table row
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:3000/deleteuser', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    // Reload the page
    location.reload();
  };
  xhr.send(payloadJSON);
}