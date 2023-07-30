// createquestion.js

window.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('questionForm');

  form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    var formData = new FormData(form);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/submitquestion', true);

    xhr.onreadystatechange = function() {
      if (xhr.status === 200) {
        // Handle the response from the server
        location.reload();      
      }
      else {
        // Handle error
        alert('Noget gik galt!');
      }
    };

    xhr.send(formData); // Send the form data as URL-encoded parameters
  });
});
