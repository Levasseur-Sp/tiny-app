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
    console.log(i);
    randomURL += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomURL;
}

// 'Databases'
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "TnyAppBot": {
    id: "TnyAppBot",
    username: "TinyAppBot",
    email: "TinyAppBot@TinyApp.ca",
    password: "12345qwertySuperSecure"
  },
  "c6ioN2fe0": {
    id: "c6ioN2",
    username: "CelineD",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// GET Requests
app.get('/', (req, res) => {
  res.send('Hello!');
  res.render('/partials/_footer');
});

app.get('/urls', (req, res) => {
  res.render("urls_index", {
    urls: urlDatabase,
    username: req.cookies["username"]
  });
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", {
    urls: urlDatabase,
    username: req.cookies["username"]
  });
});

app.get('/urls/:id', (req, res) => {
  res.render("urls_show", {
    shortURL: req.params.id,
    urls: urlDatabase,
    username: req.cookies["username"]
  });
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/user/register", (req, res) => {
  res.render("user_register", {
    username: req.cookies["username"]
  });
});

// POST Requests
app.post('/urls', (req, res) => {
  let shortURL = generateRandomString(6);
  res.redirect(`/urls/${shortURL}`);
  urlDatabase[shortURL] = req.body.longURL;
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls')
});

app.post('/user/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/user/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});

app.post('/user/register', (req, res) => {
  console.log(users);
  let userId = generateRandomString(9);

  users[userId] = {
    id: userId,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  }
  
  res.cookie('username', req.body.username);
  res.cookie('email', req.body.email);
  res.cookie('password', req.body.password, { secure: true });

  res.redirect('/urls');
});

// Surveying the express server
app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}`);
});
