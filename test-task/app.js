require('dotenv').config();

const dbAuth = require('./authQueries');
const dbParse = require('./parseQueries');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.DEV_PORT;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//AUTH ENDPOINTS
app.post('/auth/sign-up', dbAuth.signupUser);
app.post('/auth/login', dbAuth.loginUser);
app.get('/auth/logout', dbAuth.logoutUser);

//PARSE ENDPOINTS
app.get('/parse', dbParse.parsePage);
app.get('/parse-requests', dbParse.parseRequests);

app.listen(port, () => {
  console.log(`Test app listening on port ${port}`);
})

module.exports = app;
