// Required modules
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


const PORT = 8000;

// Setting up the express server
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Generates a URL of 6 randomized characters with each character's being one of 62 possibilities
// 56'800'235'584 possibilities
function generateRandomString(lengthURL) {
  const possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let randomURL = "";
  for (var i = 0; i < lengthURL; i++) {
    randomURL += possibleChars.charAt(Math.round(Math.random() * possibleChars.length) + 1);
  }
  return randomURL;
}

// MAIN
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// GET Requests
app.get('/', (req, res) => {
  res.send('Hello!');
  res.render('/partials/_footer');
});

app.get('/urls/', (req, res) => {
  res.render("urls_index", {
    urls: urlDatabase,
    username: req.cookies["user_name"]
  });
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", {
    urls: urlDatabase,
    username: req.cookies["user_name"]
  });
});

app.get('/urls/:id', (req, res) => {
  res.render("urls_show", {
    shortURL: req.params.id,
    urls: urlDatabase,
    username: req.cookies["user_name"]
  });
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// POST Requests
app.post('/urls/', (req, res) => {
  let shortURL = generateRandomString(6);
  res.redirect(`/urls/${shortURL}`);
  urlDatabase[shortURL] = req.body.longURL;
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');
});

app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls/')
});

app.post('/user/login', (req, res) => {
  res.cookie('user_name', req.body.username);
  res.redirect('/urls/');
});

app.post('/user/logout', (req, res) => {
  res.clearCookie('user_name');
  res.redirect(`/urls`);
});

// Surveying the express server
app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}`);
});
