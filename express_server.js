// Required modules
const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const db = require('./database');
const randomId = require('./randomId');


const PORT = 8080;

// Setting up the express server
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["Coffee", "Leslse"],
}));

// URLs functionnality
app.get('/', (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  else {
    return res.redirect("/user/login");
  }
});

app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    res.render("urls_index", {
      urlDatabase: db.urlDatabase,
      users: db.users,
      user_id: req.session.user_id
    });
  }
  else {
    res.statusCode = 401;
    return res.end('Need to have a TinyApp account to continue');
  }
});

app.post('/urls', (req, res) => {
  let shortURL = randomId(6);
  res.redirect(`/urls/${shortURL}`);
  db.urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    owner: req.session.user_id
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    res.render("url_new", {
      urlDatabase: db.urlDatabase,
      user_id: req.session.user_id,
      users: db.users
    });
  }
  else {
    return res.redirect('/user/login');
  }
});

app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    res.statusCode = 403;
    return res.end('Need to be logged in');
  }
  if (!db.urlDatabase[req.params.id]) {
    res.statusCode = 404;
    return res.end('The given Tiny URL doesn\'t exist');
  }
  if (req.session.user_id == db.urlDatabase[req.params.id]["owner"]) {
    res.render("url_show", {
      shortURL: req.params.id,
      urlDatabase: db.urlDatabase,
      user_id: req.session.user_id,
      users: db.users
    });
  } else {
    res.statusCode = 401;
    return res.end('Need to be the owner of this tiny url to see it\'s information')
  }
});

app.post('/urls/:id/delete', (req, res) => {
  if(!req.session.user_id){
    res.statusCode = 403;
    return res.end('Need to be logged in');
  }
  if (req.session.user_id == db.urlDatabase[req.params.id]["owner"]) {
    delete db.urlDatabase[req.params.id];
    return res.redirect('/urls');
  }
  else {
    res.statusCode = 401;
    return res.end('Need to be the owner of this tiny url to delete it')
  }
});

app.post('/urls/:id/edit', (req, res) => {
  if(!req.session.user_id){
    res.statusCode = 403;
    return res.end('Need to be logged in');
  }
  if (req.session.user_id == db.urlDatabase[req.params.id].owner) {
    db.urlDatabase[req.params.id].longURL = req.body.longURL;
    return res.redirect('/urls');
  }
  else {
    res.statusCode = 401;
    return res.end('Need to have be the owner of this tiny url to edit it');
  }
});

// Accessing the longURL of the shortURL
app.get("/u/:shortURL", (req, res) => {
  if(!db.urlDatabase[req.params.shortURL]){
    res.statusCode = 404;
    return res.end('This Tiny URL doesn\'t exist')
  }
  let longURL = db.urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Users registration, login and logout
app.get("/user/register", (req, res) => {
  res.render("user_register");
});

app.post('/user/register', (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.username) {
    res.statusCode = 400;
    return res.end('Email, username or password missing for the registration');
  }
  for (const user in db.users) {
    let email = db.users[user].email;
    if (req.body.email == email) {
      res.statusCode = 400;
      return res.end('The email is already associated with an account');
    }
  }
  let userId = randomId(9);
  req.session.user_id = userId;
  db.users[userId] = {
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }

  return res.redirect('/urls');
});

app.get('/user/login', (req, res) => {
  res.render("user_login")
});

app.post('/user/login', (req, res) => {
  for (const user in db.users) {
    let email = db.users[user].email; let password = db.users[user].password;
    if (req.body.email == email && bcrypt.compareSync(req.body.password, password)) {
      req.session.user_id = user;
      return res.redirect('/urls');
    }
  }
  if (!req.session.user_id) {
    res.statusCode = 403;
    return res.end("Incorrect email or password");
  }
});

app.post('/user/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect(`/urls`);
});

// Surveying the express server
app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}`);
});
