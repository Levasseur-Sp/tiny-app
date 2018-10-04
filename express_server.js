// Required modules
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const PORT = 8080;

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
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    owner: "TnyAppBot"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    owner: "TnyAppBot"
  },
  "i8Dut3": {
    longURL: "http://www.google.com",
    owner: "c6ioN2fe0"
  }
};

const users = {
  "TnyAppBot": {
    username: "TinyBot",
    email: "TinyAppBot@TinyApp.ca",
    password: "$2b$10$8Y6Icf1FZumKmYw1RuANYuHuW/UeiJfNGERb6uq1qodXIqItBUW1O"
  },
  "c6ioN2fe0": {
    username: "Heretic Suzan",
    email: "user2@example.com",
    password: "$2b$10$rV4MbE7KdgKj5jPYPUuEJOie9OBtlCuUZAzxLNOmI.yvupJ8mhJjS"
  }
};

// URLs functionnality
app.get('/', (req, res) => {
  res.send('Welcome to ~TinyApp~!');
  res.render('/partials/_footer');
});

app.get('/urls', (req, res) => {
  res.render("urls_index", {
    urlDatabase: urlDatabase,
    users: users,
    user_id: req.cookies["user_id"]
  });
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString(6);
  res.redirect(`/urls/${shortURL}`);
  urlDatabase[shortURL].longURL = req.body.longURL;
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    res.render("url_new", {
      urlDatabase: urlDatabase,
      user_id: req.cookies["user_id"]
    });
  }
  else {
    res.statusCode = 401;
    res.end('Need to have a TinyApp account to create a new tiny URL');
  }
});

app.get('/urls/:id', (req, res) => {
  if (req.cookies["user_id"] == urlDatabase[req.params.id]["owner"]) {
    res.render("url_show", {
      shortURL: req.params.id,
      urlDatabase: urlDatabase,
      user_id: req.cookies["user_id"]
    });
  } else {
    res.statusCode = 401;
    res.end('Need to be the owner of this tiny url to see it\'s information')
  }
});

app.post('/urls/:id/delete', (req, res) => {
  if (req.cookies["user_id"] == urlDatabase[req.params.id][owner]) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
  else {
    res.statusCode = 401;
    res.end('Need to be the owner of this tiny url to delete it')
  }
});

app.post('/urls/:id/edit', (req, res) => {
  if (req.cookies["user_id"] == urlDatabase[req.params.id].owner) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  }
  else {
    res.statusCode = 401;
    res.end('Need to have be the owner of this tiny url to edit it')
  }
});

// Accessing the longURL of the shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Users registration, login and logout
app.get("/user/register", (req, res) => {
  res.render("user_register");
});

app.post('/user/register', (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.username) {
    res.statusCode = 400;
    res.end('Email, username or password missing for the registration');
  }
  for (const user in users) {
    let email = users[user].email;
    if (req.body.email == email) {
      res.statusCode = 400;
      res.end('The email is already associated with an account');
    }
  }
  let userId = generateRandomString(9);
  res.cookie('user_id', userId);
  users[userId] = {
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }

  res.redirect('/urls');
});

app.get('/user/login', (req, res) => {
  res.render("user_login")
});

app.post('/user/login', (req, res) => {
  for (const user in users) {
    let email = users[user].email; let password = users[user].password;
    if (req.body.email == email && bcrypt.compareSync(req.body.password, password)) {
      res.cookie('user_id', user);
      res.redirect('/urls');
    }
  }
  if (!req.cookies['user_id']) {
    res.statusCode = 403;
    res.end("Incorrect email or password");
  }
});

app.post('/user/logout', (req, res) => {
  res.clearCookie('user_id');
  res.clearCookie('password');
  res.redirect(`/urls`);
});

// Surveying the express server
app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}`);
});
