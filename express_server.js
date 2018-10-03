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

// Generates a URL of lengthURL length with each character being one of 62 possibilities
// 6 random characters = 56'800'235'584 possibilities
function generateRandomString(lengthURL) {
  const possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let randomURL = "";
  for (var i = 0; i < lengthURL; i++) {
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
    username: "TinyBot",
    email: "TinyAppBot@TinyApp.ca",
    password: "12345qwertySuperSecure"
  },
  "c6ioN2fe0": {
    username: "Heretic Suzan",
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
    user_id: users[req.cookies["user_id"]]
  });
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", {
    urls: urlDatabase,
    user_id: users[req.cookies["user_id"]]
  });
});

app.get('/urls/:id', (req, res) => {
  res.render("urls_show", {
    shortURL: req.params.id,
    urls: urlDatabase,
    user_id: users[req.cookies["user_id"]]
  });
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/user/register", (req, res) => {
  res.render("user_register");
});

app.get('/user/login', (req, res) => {
  res.render("user_login")
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
  res.redirect('/urls');
});

app.post('/user/logout', (req, res) => {
  res.clearCookie('user_id');
  res.clearCookie('password');
  res.redirect(`/urls`);
});

app.post('/user/register', (req, res) => {
  if (!req.body.email || !req.body.password) res.statusCode = 400, res.send('Email or password missing for the registration');
  for (const user in users) {
    let email = users[user].email;
    if (req.body.email == email) res.statusCode = 400, res.send('The email is already associated with an account');
  }


  let userId = generateRandomString(9);
  users[userId] = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  }

  res.cookie('user_id', userId);
  res.cookie('password', req.body.password, { secure: true });


  res.redirect('/urls');
});

// Surveying the express server
app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}`);
});
