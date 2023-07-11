const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/login.html'));
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
		// Output username
		return response.send('Welcome back, ' + request.session.username + '!');
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
        return response.sendFile(path.join(__dirname + '/admin.html'));
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
                return response.sendFile(path.join(__dirname + '/admin.html'));

        }
    }});
                      

app.listen(3000, () => {console.log('Server started on port 3000');});