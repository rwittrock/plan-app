window.addEventListener('DOMContentLoaded', getquestions);

function getquestions() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://129.151.212.86:3000/getQuestions', true);
  xhr.onload = function() {
      var questions = JSON.parse(xhr.responseText);
      renderquestions(questions);
  };
  xhr.send();
}

function renderquestions(questions) {
  // Get the table body element
  var tableBody = document.getElementById("questionTableBody");

  // Clear existing rows from the table
  tableBody.innerHTML = "";

  // Only create table rows if there are questions present
  if (questions.length > 0) {
    // Loop through the questions and create table rows dynamically
    for (var i = 0; i < questions.length; i++) {
        var question = questions[i];
        // Create a new row
        var row = document.createElement("tr");

        // Create ID cell
        var idCell = document.createElement("td");
        idCell.textContent = question.id;

        // Create question cell
        var questionCell = document.createElement("td");
        questionCell.textContent = question.question;

        // Create answers cell
        var answersCell = document.createElement("td");
        var answersList = document.createElement("ul");
        answersCell.appendChild(answersList);

        var imageCell = document.createElement("td");
        var image = document.createElement("img");
        imageCell.appendChild(image);
        image.width = 600;
        image.src = "images/" + question.id + ".png";

        var answer_1 = document.createElement("li");
        answer_1.textContent = question.answer_1;
        var answer_2 = document.createElement("li");
        answer_2.textContent = question.answer_2;
        var answer_3 = document.createElement("li");
        answer_3.textContent = question.answer_3;
        var answer_4 = document.createElement("li");
        answer_4.textContent = question.answer_4;
        var answer_5 = document.createElement("li");
        answer_5.textContent = question.answer_5;


        answersList.appendChild(answer_1);
        answersList.appendChild(answer_2);
        answersList.appendChild(answer_3);
        answersList.appendChild(answer_4);
        answersList.appendChild(answer_5);
        
        // mark the correct answer with bold
        if (question.correct_answer == 1) {
            answer_1.style.fontWeight = "bold";
        } else if (question.correct_answer == 2) {
            answer_2.style.fontWeight = "bold";
        } else if (question.correct_answer == 3) {
            answer_3.style.fontWeight = "bold";
        } else if (question.correct_answer == 4) {
            answer_4.style.fontWeight = "bold";
        } else if (question.correct_answer == 5) {
            answer_5.style.fontWeight = "bold";
        }


        // Create action cell with delete button
        var actionCell = document.createElement("td");
        var deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        // The button calls the deletequestion function when clicked and sends the user id to the server
        deleteButton.setAttribute("onclick", "deleteQuestion(" + question.id + ")");
        actionCell.appendChild(deleteButton);

        // Append cells to the row
        row.appendChild(idCell);
        row.appendChild(questionCell);
        row.appendChild(imageCell)
        row.appendChild(answersCell);
        row.appendChild(actionCell);

        // Append the row to the table body
        tableBody.appendChild(row);
        }
    } else {
        // Handle case when there are no questions
        var emptyRow = document.createElement("tr");
        var emptyCell = document.createElement("td");
        emptyCell.setAttribute("colspan", "5");
        emptyCell.textContent = "No questions found.";
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
    }
}


function deleteQuestion(questionId) {
  // Create a payload object with the userId
  var payload = {
    questionId: questionId
  };

  // Convert the payload to JSON
  var payloadJSON = JSON.stringify(payload);

  // Send the HTTP request to delete the user based on the id found in its HTML table row
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://129.151.212.86:3000/deletequestion', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    // Reload the page
    location.reload();
  };
  xhr.send(payloadJSON);
}