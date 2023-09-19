window.addEventListener('DOMContentLoaded', function () {
  checkTimeAndRedirect(); // Check initially
  setInterval(checkTimeAndRedirect, 30000); // Check every minute (adjust as needed)
});

function checkTimeAndRedirect() {
  // Get the current date and time
  var currentTime = new Date();
  var currentHour = currentTime.getHours();
  var currentMinute = currentTime.getMinutes();

  // Check if the current hour is 20 or later
  if (currentHour >= 10 && currentMinute >= 38) {
    // Redirect to the specified page
    window.location.href = "http://138.2.151.211:3000/nomoretime";
  } else {
    // If it's not 20 or later, continue with your original code
    getQuestion();
  }
}

//add eventlistener to submit button
//prevent default form submit

function getQuestion() {
 

  document.getElementById("answer_form").addEventListener("submit", function(event){
    event.preventDefault()
    submitAnswer();
});
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://138.2.151.211:3000/getquestion', true);
    xhr.onload = function() {
      if(xhr.responseText == "finished") {
        window.location.href = "http://138.2.151.211:3000/finish";
        return;
      }
        document.getElementById("answer_form").disabled=false;
        var question = JSON.parse(xhr.responseText);
        correct_answer = question.correct_answer;
        renderQuestion(question);
    };
    xhr.send();
  }

  function renderQuestion(question) {
    document.getElementById("image").src = "images/" + question.id + ".png";
    document.getElementById("question").textContent = question.question;
    document.getElementById("answer1_label").innerHTML = question.answer_1;
    document.getElementById("answer2_label").innerHTML = question.answer_2;
    document.getElementById("answer3_label").innerHTML = question.answer_3;
    document.getElementById("answer4_label").innerHTML = question.answer_4;
    document.getElementById("answer5_label").innerHTML = question.answer_5;
  };

  function submitAnswer() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://138.2.151.211:3000/submitanswer', true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json");

    var payload = {
      answer: parseInt((JSON.stringify({answer: document.querySelector('input[name="answer"]:checked').value})).replace(/\D/g,'')),
      correct_answer: correct_answer
    };

    xhr.send(JSON.stringify(payload));
    xhr.onload = function() {
        //if answer is correct
        if (xhr.responseText == "correct") {
          //alert correct
          alert("Korrekt!");
          //get new question
          window.location.reload();
    } else { 
      //if answer is incorrect
      //alert incorrect
      alert("Forkert! Prøv igen");
  }}};