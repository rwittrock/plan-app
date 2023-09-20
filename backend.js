const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const fs = require('fs');


const multer  = require('multer');
const res = require('express/lib/response');
const upload = multer({ dest: 'public/images/' });

// Create connection to the database
const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'db_user',
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
	writeToLog(request.ip + " requested get /");
	// Render login template
	response.sendFile(path.join(__dirname + '/public/static_content/login.html'));
});

// http://localhost:3000/nomoretime
app.get('/nomoretime', function(request, response) {
	writeToLog(request.ip + " requested get /nomoretime");
	// If the user is loggedin
	if (request.session.loggedin) {
		// Return the interface page
		writeToLog(request.ip + " ran out of time and is redirected to /nomoretime");
		return response.sendFile(path.join(__dirname + '/public/static_content/timerunout.html'));

	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /nomoretime without being logged in");

		return response.send('Du skal logge ind på en konto for at se dette indhold');
	}
});

// http://localhost:3000/auth
app.post('/auth', function(request, response) {
	writeToLog(request.ip + " requested post /auth");
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	writeToLog(request.ip + " attempted to login with credentials " + username + " " + password + "");
	let userID;
    let admin = false;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error){
				writeToLog(request.ip + " encountered an error while logging in: " + error);
				throw error;
			} 
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
                request.session.admin = results[0].admin;
				request.session.userID = results[0].id;
				writeToLog(request.ip + " logged in successfully");

				// Redirect
				if (request.session.admin == true) {
					writeToLog(request.ip + " is an admin and is redirected to /admin")
					response.redirect('/admin');
				}
                else{
					write(request.ip + " is not an admin and is redirected to /home")
					response.redirect('/home');}

			} else {
				return response.send('Forkert brugernavn og/eller adgangskode');
				writeToLog(request.ip + " entered wrong username and/or password")
			}
		});
	} else {
		writeToLog(request.ip + " did not enter a username and/or password")

		return response.send('Indtast venligst brugernavn og kodeord');
	}
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	writeToLog(request.ip + " requested get /home");
	// If the user is loggedin
	if (request.session.loggedin) {
		// Return the interface page
		writeToLog(request.ip + " is redirected to /home");
		return response.sendFile(path.join(__dirname + '/public/static_content/interface.html'));

	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /home without being logged in");
		return response.send('Du skal logge ind på en konto for at se dette indhold');
	}
});

// http://localhost:3000/shuffle
app.get('/shuffle', function(request, response) {
	writeToLog(request.ip + " requested get /shuffle");
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		//return the admin page
		writeToLog(request.ip + " is redirected to /shuffle");
        return response.sendFile(path.join(__dirname + '/public/static_content/shuffleQuestions.html'));
	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /shuffle without being logged in");
		return response.send('Du skal logge ind på en admin konto for at se dette indhold');
	}
});

app.get('/finish', function(request, response) {
	writeToLog(request.ip + " requested get /finish");
	// If the user is loggedin
	if (request.session.loggedin) {
		// Return the finish page
		writeToLog(request.ip + " is redirected to /finish");
		return response.sendFile(path.join(__dirname + '/public/static_content/finish.html'));
	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /finish without being logged in");
		return response.send('Du skal logge ind på en konto for at se dette indhold');
	}
});

// http://localhost:3000/admin
app.get('/admin', function(request, response) {
	writeToLog(request.ip + " requested get /admin");
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		writeToLog(request.ip + " is redirected to /admin");
		//return the admin page
        return response.sendFile(path.join(__dirname + '/public/static_content/admin.html'));
	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /admin without being logged in or not being an admin");
		return response.send('Du skal logge ind på en admin konto for at se dette indhold');
	}
});

app.get(`/createuser`, function(request, response) {
	writeToLog(request.ip + " requested get /createuser");
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		//return the create user page
		writeToLog(request.ip + " is redirected to /createuser");
		return response.sendFile(path.join(__dirname + '/public/static_content/createuser.html'));
	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /createuser without being logged in or not being an admin");
		return response.send('Du skal logge ind på en admin konto for at se dette indhold');
	}
});

app.get(`/userlist`, function(request, response) {
	writeToLog(request.ip + " requested get /userlist");
	// If the user is loggedin 
	if (request.session.loggedin && request.session.admin) {
		//return the delete user page
		writeToLog(request.ip + " is redirected to /userlist");
		return response.sendFile(path.join(__dirname + '/public/static_content/userlist.html'));
	} else {
		writeToLog(request.ip + " tried to access /userlist without being logged in or not being an admin");
		// Not logged in
		return response.send('Du skal logge ind på en admin konto for at se dette indhold');
	}
});

app.get(`/getusers`, function(request, response) {
	writeToLog(request.ip + " requested get /getusers");
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		writeToLog(request.ip + " is redirected to /getusers");
		//return the delete user page
		connection.query('SELECT * FROM accounts', function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error){ 
				writeToLog(request.ip + " encountered an error while getting users: " + error);
				throw error;
			}
			// return the results in a list
			writeToLog(request.ip + " got users successfully");
			return response.send(results);
		});
	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /getusers without being logged in or not being an admin");
		return response.send('Du skal logge ind på en admin konto for at se dette indhold');
	}
});
				

// method for creating a new user
app.post('/create', function(request, response) {
	writeToLog(request.ip + " requested post /create");
    // check that whoever sent the request is an admin
    if (request.session.loggedin && request.session.admin) {
        // Capture the input fields
        let username = request.body.username;
        let password = request.body.password;
		writeToLog(request.ip + " attempted to create user with credentials " + username + " " + password + "");
        // Ensure the input fields exists and are not empty
        if (username && password) {
            connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
                // If there is an issue with the query, output the error
                if (error){ 
					writeToLog(request.ip + " encountered an error while creating user: " + error);
					throw error;}
                // If the account exists
                if (results.length > 0) {
                    // Output username
					writeToLog(request.ip + " tried to create user with credentials " + username + " " + password + " but the user already exists");
                    return response.send('User already exists! Please delete 1 of the users with this username, to ensure the system works');
                }
				else{
					// Execute SQL query that'll create a new user with the specified username and password. admin should be false by default
					connection.query('INSERT INTO accounts (username, password, admin) VALUES (?, ?, ?)', [username, password, false], function(error, results, fields){ 
						// If there is an issue with the query, output the error
						if (error){
							writeToLog(request.ip + " encountered an error while creating user: " + error);
							throw error;
						}
					else{
						writeToLog(request.ip + " created user with credentials " + username + " " + password + "");
					} })
						writeToLog(request.ip + " is redirected to /admin");
						return response.sendFile(path.join(__dirname + '/public/static_content/admin.html'));
				}})
                    
                
                

        }
    }});

// method for deleting a user, based on the id it receives in the payload
app.post('/deleteuser', function(request, response) {
	writeToLog(request.ip + " requested post /deleteuser");
	// check that whoever sent the request is an admin
	if (request.session.loggedin && request.session.admin) {
		// Capture the input fields
		let userId = request.body.userId;
		writeToLog(request.ip + " attempted to delete user with id " + userId + "");
		// Ensure the input fields exists and are not empty
		if (userId) {
			// Execute SQL query that'll delete the user with the specified id
			connection.query('DELETE FROM accounts WHERE id = ?', [userId], function(error, results, fields) {
				// If there is an issue with the query, output the error
				if (error){ 
					throw error;
				} else {
					writeToLog(request.ip + " deleted user with id " + userId + "");
				}
				// Output username
				return response.send('User deleted!');});
		}
	}
});

app.get(`/createquestion`, function(request, response) {
	writeToLog(request.ip + " requested get /createquestion");
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		//return the create question page
		writeToLog(request.ip + " is redirected to /createquestion");
		response.sendFile(path.join(__dirname + '/public/static_content/createquestion.html'));
	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /createquestion without being logged in or not being an admin");
		return response.send('Du skal logge ind på en admin konto for at se dette indhold');
	}
});

app.post('/submitquestion', upload.single("image"), async function(request, response) {
	writeToLog(request.ip + " requested post /submitquestion");
	//set header to Content-Type: multipart/form-data
	request.headers['content-type'] = 'multipart/form-data';
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
	  let image = request.file;
		writeToLog(request.ip + " attempted to create question with credentials " + question + ", " + answer_1 + ", " + answer_2 + ", " + answer_3 + ", " + answer_4 + ", " + answer_5 + ", correct:" + correct_answer + ", image exists: " + Boolean(image) + "");
	  // Ensure the input fields exist and are not empty
	  if (question && answer_1 && answer_2 && answer_3 && answer_4 && answer_5 && correct_answer && image) {
		try {
		  // Execute SQL query that'll create a new question with the specified fields
		  await new Promise((resolve, reject) => {

			connection.query('INSERT INTO tasks (question, answer_1, answer_2, answer_3, answer_4, answer_5, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [question, answer_1, answer_2, answer_3, answer_4, answer_5, correct_answer],
            function (error, results, fields) {
              if (error) {
				writeToLog(request.ip + " encountered an error while creating question: " + error);
			  reject(error);
			}
              // Get the path to the uploaded image file
              const imagePath = image.path;

              // Read the image data and save it using fs.writeFile
              fs.readFile(imagePath, 'base64', function (err, data) {
                if (err) {
					writeToLog(request.ip + " encountered an error while creating question: " + err);
                  reject(err);
                } else {
                  // Save the image to a file with the appropriate name
                  const fileName = "public/images/" + results.insertId + ".png";
                  fs.writeFile(fileName, data, 'base64', function (err) {
                    if (err) {
						writeToLog(request.ip + " encountered an error while creating question: " + err);
                      reject(err);
                    } else {
						writeToLog(request.ip + " succesfully created question")
                      resolve();
                    }
                  });
                }
              });
            }
          );
        });
		  // Output success status
		  return response.sendStatus(200);
		} catch (error) {
		  // If there is an issue with the query, output the error
		  console.error(error);
		  writeToLog(request.ip + " encountered an error while creating question: " + error);
		  return response.sendStatus(400);
		}
	  } 
	}
  });
  
app.get(`/questionlist`, function(request, response) {
	writeToLog(request.ip + " requested get /questionlist");
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		//return the delete question page
		writeToLog(request.ip + " is redirected to /questionlist");
		return response.sendFile(path.join(__dirname + '/public/static_content/questionlist.html'));
	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /questionlist without being logged in or not being an admin");
		return response.send('Du skal logge ind på en admin konto for at se dette indhold');
	}
});

app.get(`/getquestions`, function(request, response) {
	writeToLog(request.ip + " requested get /getquestions");
	// If the user is loggedin
	if (request.session.loggedin && request.session.admin) {
		//return the delete question page
		connection.query('SELECT * FROM tasks', function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) {
				writeToLog(request.ip + " encountered an error while getting questions: " + error);
				throw error;
			}else{
			// return the results in a list
			writeToLog(request.ip + " got questions successfully");
			return response.send(results);}
		});
	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /getquestions without being logged in or not being an admin");
		return response.send('Du skal logge ind på en admin konto for at se dette indhold');
	}
});

// method for deleting a question, based on the id it receives in the payload
app.post('/deletequestion', function(request, response) {
	writeToLog(request.ip + " requested post /deletequestion");
	// check that whoever sent the request is an admin
	if (request.session.loggedin && request.session.admin) {
		// Capture the input fields
		let questionId = request.body.questionId;
		writeToLog(request.ip + " attempted to delete question with id " + questionId + "");
		// Ensure the input fields exists and are not empty
		if (questionId) {
			// Execute SQL query that'll delete the question with the specified id
			connection.query('DELETE FROM tasks WHERE id = ?', [questionId], function(error, results, fields) {
				// If there is an issue with the query, output the error
				if (error) {
					writeToLog(request.ip + " encountered an error while deleting question: " + error);
					throw error;
				} else{
				// Output username
				writeToLog(request.ip + " deleted question with id " + questionId + "");
				return response.send('Question deleted!');}});
		}
	}
});




app.get('/shufflequestions', function(request, response) {
	writeToLog(request.ip + " requested get /shufflequestions");
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
			writeToLog(request.ip + " populated json file successfully");
        })
        .catch((error) => {
			writeToLog(request.ip + " encountered an error while populating json file: " + error);
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
	writeToLog(request.ip + " requested get /getquestion");
	// If the user is loggedin
	if (request.session.loggedin) {
		//get the id of the user from the database
	const userID = request.session.userID;
	const questionID = getQuestion(userID);
	writeToLog(request.ip + " got question id " + questionID + "");
	
	connection.query('SELECT * FROM tasks WHERE id = ?', [questionID], function(error, results, fields) {
		if (error) {
			writeToLog(request.ip + " encountered an error while getting question: " + error);
			throw error;}
		// if results[0] is undefined, redirect to finish page
		if (results[0] === undefined) {
			writeToLog(request.ip + " ran out of questions and is redirected to /finish");
			return response.send('finished');
		}
		// return the question
		writeToLog(request.ip + " got question successfully");
		return response.send(results[0]);
	});
	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /getquestion without being logged in");
		return response.send('Du skal logge ind på en konto for at se dette indhold');
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
	writeToLog(request.ip + " requested get /results");
	// If the user is admin and logged in
	if (request.session.loggedin && request.session.admin) {
		writeToLog(request.ip + " is redirected to /results");
		return response.sendFile(path.join(__dirname + '/public/static_content/results.html'));
	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /results without being logged in or not being an admin");
		return response.send('Du skal logge ind på en admin konto for at se dette indhold');
	}
});

app.get('/getresults', function(request, response) {
	writeToLog(request.ip + " requested get /getresults");
	// If the user is admin and logged in
	if (request.session.loggedin && request.session.admin) {
		//return the output.json file
		const jsonContent = fs.readFileSync('output.json', 'utf8');
		const parsedData = JSON.parse(jsonContent);
		writeToLog(request.ip + " got results successfully");
		return response.send(parsedData);
	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /getresults without being logged in or not being an admin");
		return response.send('Du skal logge ind på en admin konto for at se dette indhold');
	}
});


app.post('/submitanswer', function(request, response) {
	writeToLog(request.ip + " requested post /submitanswer");
	//check if user is logged in
	if (request.session.loggedin) {
		// Capture the input fields
	let answer = request.body.answer;
	let correct_answer = request.body.correct_answer;
	let session_question_id = request.body.questionID;
	const userID = request.session.userID;
	//get the id of the question the user is answering from the json
	const jsonContent = fs.readFileSync('output.json', 'utf8');
	const parsedData = JSON.parse(jsonContent);
	const userData = parsedData.find((user) => user.userID == userID);
	const questionID = userData.questions[userData.count];
	
	// Ensure the input fields exists and are not empty
	if (answer && userID && questionID) {
		writeToLog(request.ip + " attempted to submit answer " + answer + " to question with id " + questionID + "");
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
			writeToLog(request.ip + " submitted correct answer to question with id " + questionID + "");
			return response.send('correct');
		} else {
			const jsonContent = fs.readFileSync('output.json', 'utf8');
			const parsedData = JSON.parse(jsonContent);
			const userData = parsedData.find((user) => user.userID == userID);
			userData.attempts++;
			fs.writeFileSync('output.json', JSON.stringify(parsedData, null, 2), 'utf8');
			writeToLog(request.ip + " submitted incorrect answer to question with id " + questionID + "");
			return response.send('incorrect');
		}
	}
	else {
		writeToLog(request.ip + " did not submit an answer to question with id " + questionID + "");
		return response.send('Please select an answer!');
	}
	} else {
		// Not logged in
		writeToLog(request.ip + " tried to access /submitanswer without being logged in");
		return response.send('Du skal logge ind på en konto for at se dette indhold');
	}	
});	

function writeToLog(logMessage) {
	// Get the current date and time
	var currentTime = new Date();
	var currentDate = currentTime.getDate();
	var currentHour = currentTime.getHours();
	var currentMinute = currentTime.getMinutes();
	var currentSecond = currentTime.getSeconds();
	fs.appendFileSync('log.txt',"Date: " + currentDate + ", Time: " + currentHour +":"+currentMinute+":"+currentSecond+", Message: " + logMessage + '\n');
}

app.listen(3000, () => {console.log('Server started on port 3000');});