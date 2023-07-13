const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const fs = require('fs');


const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'nodelogin'
});

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

// http://localhost:3000/
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/public/static_content/login.html'));
});

// http://localhost:3000/auth
app.post('/auth', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
    let admin = false;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
                request.session.admin = results[0].admin;

				// Redirect
				if (request.session.admin == true) response.redirect('/admin');
                else response.redirect('/home');

			} else {
				return response.send('Incorrect Username and/or Password!');
			}
		});
	} else {
		return response.send('Please enter Username and Password!');
	}
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Return the interface page
		return response.sendFile(path.join(__dirname + '/public/static_content/interface.html'));

	} else {
		// Not logged in
		return response.send('Please login to view this page!');
	}
});

// http://localhost:3000/admin
app.get('/admin', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		//return the admin page
        return response.sendFile(path.join(__dirname + '/public/static_content/admin.html'));
	} else {
		// Not logged in
		return response.send('Please login to an admin account to view this page!');
	}
});

app.get(`/createuser`, function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		//return the create user page
		return response.sendFile(path.join(__dirname + '/public/static_content/createuser.html'));
	} else {
		// Not logged in
		return response.send('Please login to an admin account to view this page!');
	}
});

app.get(`/userlist`, function(request, response) {
	// If the user is loggedin 
	if (request.session.loggedin && request.session.admin) {
		//return the delete user page
		return response.sendFile(path.join(__dirname + '/public/static_content/userlist.html'));
	} else {
		// Not logged in
		return response.send('Please login to an admin account to view this page!');
	}
});

app.get(`/getusers`, function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		//return the delete user page
		connection.query('SELECT * FROM accounts', function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// return the results in a list
			return response.send(results);
		});
	} else {
		// Not logged in
		return response.send('Please login to an admin account to view this page!');
	}
});
				

// method for creating a new user
app.post('/create', function(request, response) {
    // check that whoever sent the request is an admin
    if (request.session.loggedin && request.session.admin) {
        // Capture the input fields
        let username = request.body.username;
        let password = request.body.password;
        // Ensure the input fields exists and are not empty
        if (username && password) {
            connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
                // If there is an issue with the query, output the error
                if (error) throw error;
                // If the account exists
                if (results.length > 0) {
                    // Output username
                    return response.send('User already exists!');
                }})
                    
                
                // Execute SQL query that'll create a new user with the specified username and password. admin should be false by default
                connection.query('INSERT INTO accounts (username, password, admin) VALUES (?, ?, ?)', [username, password, false], function(error, results, fields){ 
                // If there is an issue with the query, output the error
                if (error) throw error;})
                return response.sendFile(path.join(__dirname + '/public/static_content/admin.html'));

        }
    }});

// method for deleting a user, based on the id it receives in the payload
app.post('/deleteuser', function(request, response) {
	// check that whoever sent the request is an admin
	if (request.session.loggedin && request.session.admin) {
		// Capture the input fields
		let userId = request.body.userId;
		// Ensure the input fields exists and are not empty
		if (userId) {
			// Execute SQL query that'll delete the user with the specified id
			connection.query('DELETE FROM accounts WHERE id = ?', [userId], function(error, results, fields) {
				// If there is an issue with the query, output the error
				if (error) throw error;
				// Output username
				return response.send('User deleted!');});
		}
	}
});

app.get(`/createquestion`, function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		//return the create question page
		response.sendFile(path.join(__dirname + '/public/static_content/createquestion.html'));
	} else {
		// Not logged in
		return response.send('Please login to an admin account to view this page!');
	}
});

app.post('/submitquestion', async function(request, response) {
	// check that whoever sent the request is an admin
	if (request.session.loggedin && request.session.admin) {
	  // Capture the input fields
	  let question = request.body.question;
	  let answer_1 = request.body.answer1;
	  let answer_2 = request.body.answer2;
	  let answer_3 = request.body.answer3;
	  let answer_4 = request.body.answer4;
	  let answer_5 = request.body.answer5;
	  let correct_answer = request.body.correctAnswer;
  
	  // Ensure the input fields exist and are not empty
	  if (question && answer_1 && answer_2 && answer_3 && answer_4 && answer_5 && correct_answer) {
		try {
		  // Execute SQL query that'll create a new question with the specified fields
		  await new Promise((resolve, reject) => {
			connection.query('INSERT INTO tasks (question, answer_1, answer_2, answer_3, answer_4, answer_5, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
			  [question, answer_1, answer_2, answer_3, answer_4, answer_5, correct_answer],
			  function(error, results, fields) {
				if (error) reject(error);
				resolve();
			  }
			);
		  });
		  // Output success status
		  return response.sendStatus(200);
		} catch (error) {
		  // If there is an issue with the query, output the error
		  console.error(error);
		  return response.sendStatus(400);
		}
	  } 
	}
  });
  
app.get(`/questionlist`, function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		//return the delete question page
		return response.sendFile(path.join(__dirname + '/public/static_content/questionlist.html'));
	} else {
		// Not logged in
		return response.send('Please login to an admin account to view this page!');
	}
});

app.get(`/getquestions`, function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		//return the delete question page
		connection.query('SELECT * FROM tasks', function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// return the results in a list
			return response.send(results);
		});
	} else {
		// Not logged in
		return response.send('Please login to an admin account to view this page!');
	}
});

// method for deleting a question, based on the id it receives in the payload
app.post('/deletequestion', function(request, response) {
	// check that whoever sent the request is an admin
	if (request.session.loggedin && request.session.admin) {
		// Capture the input fields
		let questionId = request.body.questionId;
		// Ensure the input fields exists and are not empty
		if (questionId) {
			// Execute SQL query that'll delete the question with the specified id
			connection.query('DELETE FROM tasks WHERE id = ?', [questionId], function(error, results, fields) {
				// If there is an issue with the query, output the error
				if (error) throw error;
				// Output username
				return response.send('Question deleted!');});
		}
	}
});

app.get('/shufflequestions', function(request, response) {

	let userIDs = [];
	let questionIDs = [];

	//query database for user ids
	connection.query('SELECT * FROM accounts', function(error, results, fields) {
		// If there is an issue with the query, output the error
		if (error) throw error;
		// return the results in a list
		results.forEach((result) => {
			userIDs.push(result.id);
		});
		console.log(userIDs.length())
	});

	//query database for question ids
	connection.query('SELECT * FROM tasks', function(error, results, fields) {
		// If there is an issue with the query, output the error
		if (error) throw error;
		// return the results in a list
		results.forEach((result) => {
			questionIDs.push(result.id);
		});
	});


	generateJSONFile(userIDs, questionIDs);
});


function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
	  const j = Math.floor(Math.random() * (i + 1));
	  [array[i], array[j]] = [array[j], array[i]];
	}
	return array;
  }

function generateJSONFile(userIDs, questionIDs) {
	const jsonContent = [];

	userIDs.forEach((userID, index) => {
  const shuffledQuestions = shuffleArray(questionIDs.slice());
  const userData = {
	userID: userID,
	questions: shuffledQuestions,
	count: 0,
  };
  jsonContent.push(userData);
});

const jsonFileContent = JSON.stringify(jsonContent, null, 2);
fs.writeFileSync('output.json', jsonFileContent, 'utf8');
}



app.listen(3000, () => {console.log('Server started on port 3000');});