window.addEventListener('DOMContentLoaded', getQuestion);

function getQuestion() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/getquestion', true);
    xhr.onload = function() {
        var question = JSON.parse(xhr.responseText);
        renderQuestion(question);
    };
    xhr.send();
  }

function renderQuestion(question) {
    var title = document.getElementById("question");
    title.textContent = question.question;
    var answer1 = document.getElementById("answer1");
    answer1.textContent = question.answer1;
    var answer2 = document.getElementById("answer2");
    answer2.textContent = question.answer2;
    var answer3 = document.getElementById("answer3");
    answer3.textContent = question.answer3;
    var answer4 = document.getElementById("answer4");
    answer4.textContent = question.answer4;
    var answer5 = document.getElementById("answer5");
    answer5.textContent = question.answer5;
};