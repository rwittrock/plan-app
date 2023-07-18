const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const cryptoJS = require('crypto-js');
const key = "asfgvbsdhjvb"

const pointsFile = 'points.json';

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
	let userID;
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
				request.session.userID = results[0].id;

				// Redirect
				if (request.session.admin == true) response.redirect('/admin');
                else return response.redirect('/home');

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

app.get('/finish', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Return the finish page
		return response.sendFile(path.join(__dirname + '/public/static_content/finish.html'));
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
	let usernames = [];

    // Promise for querying user ids
    const queryUserIDs = new Promise((resolve, reject) => {
        connection.query('SELECT * FROM accounts', function(error, results, fields) {
            if (error) {
                reject(error);
            } else {
                results.forEach((result) => {
                    userIDs.push(result.id);					
					usernames.push(result.username);
                });
                resolve();
            }
        });
    });

    // Promise for querying question ids
    const queryQuestionIDs = new Promise((resolve, reject) => {
        connection.query('SELECT * FROM tasks', function(error, results, fields) {
            if (error) {
                reject(error);
            } else {
                results.forEach((result) => {
                    questionIDs.push(result.id);
                });
                resolve();
            }
        });
    });

    // Wait for both promises to resolve
    Promise.all([queryUserIDs, queryQuestionIDs])
        .then(() => {
            generateJSONFile(userIDs, questionIDs, usernames);
            response.send('Data populated successfully.');
        })
        .catch((error) => {
            response.status(500).send('Error: ' + error);
        });
});
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
	  const j = Math.floor(Math.random() * (i + 1));
	  [array[i], array[j]] = [array[j], array[i]];
	}
	return array;
  }

function generateJSONFile(userIDs, questionIDs, usernames) {
	const jsonContent = [];

	index = 0;

	userIDs.forEach((userID, index) => {
  const shuffledQuestions = shuffleArray(questionIDs.slice());
  const userData = {
	userID: userID,
	username: usernames[index],
	questions: shuffledQuestions,
	count: 0,
	attempts: 0,
	questions_answered: 0

  };
  index++;
  jsonContent.push(userData);
});

const jsonFileContent = JSON.stringify(jsonContent, null, 2);
fs.writeFileSync('output.json', jsonFileContent, 'utf8');
}

app.get('/getquestion', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		//get the id of the user from the database
	const userID = request.session.userID;
	const questionID = getQuestion(userID);
	connection.query('SELECT * FROM tasks WHERE id = ?', [questionID], function(error, results, fields) {
		if (error) throw error;
		// if results[0] is undefined, redirect to finish page
		if (results[0] === undefined) {
			return response.send('finished');
		}
		// return the question
		return response.send(results[0]);
	});
	} else {
		// Not logged in
		return response.send('Please login to view this page!');
	}

	
});

function getQuestion(userID) {
    const jsonContent = fs.readFileSync('output.json', 'utf8');
    const parsedData = JSON.parse(jsonContent);
	const userData = parsedData.find((user) => user.userID == userID);


    if (userData && userData.questions) {
        const questionID = userData.questions[userData.count];
        fs.writeFileSync('output.json', JSON.stringify(parsedData, null, 2), 'utf8');
        return questionID;
    } else {
        // Handle the case when userData or userData.questions is undefined
        // For example, you can return a default value or throw an error
        throw new Error('User data or questions not found');
    }
}

app.get('/results', function(request, response) {
	// If the user is admin and logged in
	if (request.session.loggedin && request.session.admin) {
		return response.sendFile(path.join(__dirname + '/public/static_content/results.html'));
	} else {
		// Not logged in
		return response.send('Please login to an admin account to view this page!');
	}
});

app.get('/getresults', function(request, response) {
	// If the user is admin and logged in
	if (request.session.loggedin && request.session.admin) {
		//return the output.json file
		const jsonContent = fs.readFileSync('output.json', 'utf8');
		const parsedData = JSON.parse(jsonContent);
		return response.send(parsedData);
	} else {
		// Not logged in
		return response.send('Please login to an admin account to view this page!');
	}
});


app.post('/submitanswer', function(request, response) {
	//check if user is logged in
	if (request.session.loggedin) {
		// Capture the input fields
	let answer = request.body.answer;
	let correct_answer = request.body.correct_answer;
	const userID = request.session.userID;
	//get the id of the question the user is answering from the json
	const jsonContent = fs.readFileSync('output.json', 'utf8');
	const parsedData = JSON.parse(jsonContent);
	const userData = parsedData.find((user) => user.userID == userID);
	const questionID = userData.questions[userData.count];

	// Ensure the input fields exists and are not empty
	if (answer && userID && questionID) {
		console.log(answer);
		console.log(correct_answer);
		//check that the submitted answer is correct
		if (answer === correct_answer) {
			//increment count in the json file
			const jsonContent = fs.readFileSync('output.json', 'utf8');
			const parsedData = JSON.parse(jsonContent);
			const userData = parsedData.find((user) => user.userID == userID);
			userData.count++;
			userData.attempts++;
			userData.questions_answered++;
			fs.writeFileSync('output.json', JSON.stringify(parsedData, null, 2), 'utf8');
			return response.send('correct');
		} else {
			const jsonContent = fs.readFileSync('output.json', 'utf8');
			const parsedData = JSON.parse(jsonContent);
			const userData = parsedData.find((user) => user.userID == userID);
			userData.attempts++;
			fs.writeFileSync('output.json', JSON.stringify(parsedData, null, 2), 'utf8');
			return response.send('incorrect');
		}
	}
	else {
		return response.send('Please select an answer!');
	}
	} else {
		// Not logged in
		return response.send('Please login to view this page!');
	}

	
	
});
/*
const getCorrectAnswer = (questionID) => {
	const correct_answer = //get the correct answer from the database asynchronusly
	connection.query('SELECT * FROM tasks WHERE id = ?', [questionID], function(error, results, fields) {
		console.log("correct answer call " + results[0].correct_answer);
		correct_answer = String(results[0].correct_answer);
		if (error) throw error;
	}	);
	return correct_answer;
}

*/

//method which makes a json file if it doesnt exist, puts in the ids of all users, and takes a user id and question id and a boolean as an input
//if the boolean is true 

	


app.listen(3000, () => {console.log('Server started on port 3000');});