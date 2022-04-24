const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const PORT = 8080;
const app = express();
const cookieSession = require("cookie-session");
const { getUserByEmail, generateRandomString, getUrlsForUserId } = require("./helpers");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["super secret key"],
}));
app.set('view engine', 'ejs');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//POST request for user to register input information
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password);

  if (!email || !password) {
    return res.status(400).send("Please enter valid inputs!");
  }

  //If someone tries to register with an email that is already in the users object,
  if (getUserByEmail(email, users)) {
    return res.status(403).send("SORRY: This email has already been used");
  }

  const id = generateRandomString(4);

  const user = {
    id: id,
    email: email,
    password: hashedPassword,
  };

  users[id] = user;
  req.session.userId = user.id; // set cookie
  res.redirect("/urls");
});

// POST req for user login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  
  if (!user) {
    return res.status(403).send(`SORRY: Could not find a user with the email ${email}`);
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("SORRY: This login information is invalid");
  }
  req.session.userId = user.id; // set cookie
  res.redirect("/urls");
});

//POST request for Logout
app.post("/logout", (req, res) => {
  req.session = null;// clear cookie
  res.redirect("/login");
});
  
//POST route that removes a URL by accessing shortURL key
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userId;

  if (!userID || urlDatabase[shortURL].userID !== userID) {
    return res.status(401).send("SORRY: You must be logged in to delete url!");
  }
  delete urlDatabase[shortURL];//delete by acessing shortURL key
  res.redirect("/urls");
});
  
// POST request from client to edit URLs
app.post("/urls/:id", (req, res) => {
  const newShortUrl = req.params.id;
  const userID = req.session.userId;

  if (!userID || urlDatabase[newShortUrl].userID !== userID) {
    return res.status(401).send("SORRY: You must be logged in to edit a url!");
  }

  //Database is updated with longURL from the client
  urlDatabase[newShortUrl].longURL = req.body.longURL;
  res.redirect("/urls");
});
  
//Post to urls page where list of urls with their shortURL keys is looped over and displayed
app.post("/urls", (req, res) => {
  const userID = req.session.userId;
  
  if (!userID) {
    return res.status(401).send("SORRY: You must be logged in to add new url!");
  }
  const longURL = req.body.longURL;
  let newShortUrl = generateRandomString(6);
  urlDatabase[newShortUrl] = { userID , longURL }; //urlDatabase is updated
  
  res.redirect(`/urls/${newShortUrl}`); //Redirects to /urls/with the new short url value displayed
});
  

//Get request for register file
app.get("/register", (req, res) => {
  const loggedInUser = req.session.userId;
  const templateVars = { user: users[loggedInUser] };

  if (!loggedInUser) {
    res.render("register", templateVars);
  }
  res.redirect("/urls");
});

//Get request for login file
app.get("/login", (req, res) => {
  const loggedInUser = req.session.userId;
  const templateVars = { user: users[loggedInUser] };

  if (!loggedInUser) {
    res.render("login", templateVars);
  }
  res.redirect("/urls");
});

//Get page /urls where list of urls is looped over and displayed
app.get("/urls", (req, res) => {
  const loggedInUser = req.session.userId;

  if (!loggedInUser) {
    res.status(401).send("Please login to access Tinyapp.");
  }
  const urlsForUser = getUrlsForUserId(loggedInUser, urlDatabase);
  const templateVars = { urls: urlsForUser, user: users[loggedInUser] };
  res.render("urls_index", templateVars);
});
  
//Create new URL page
app.get("/urls/new", (req, res) => {
  const loggedInUser = req.session.userId;
  
  if (!loggedInUser) {
    res.redirect("/login");
  }
  const templateVars = { user: users[loggedInUser] };
  res.render("urls_new", templateVars);
});
  
//Get shortURl page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const loggedInUser = req.session.userId;
  const urlInfo = urlDatabase[req.params.shortURL];
  
  if (!urlInfo) {
    res.status(401).send("Sorry: Incorrect URL");
  }
  if (!loggedInUser) {
    return res.status(401).send("SORRY: You are not logged in!");
  }
  if (urlDatabase[shortURL].userID !== loggedInUser) {
    return res.status(401).send("SORRY: You do no have permission to access this page!");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const templateVars = { shortURL, longURL, user: users[loggedInUser] };
  res.render("urls_show", templateVars);
});
  
//Get new route for shortURL requests. Where it redirects to the corresponding longURL
app.get("/u/:shortURL", (req, res) => {
  const urlInfo = urlDatabase[req.params.shortURL];

  if (!urlInfo) {
    res.status(401).send("Sorry: Incorrect URL");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
    
app.get("/", (req, res) => {
  const user = req.session.userId;
  
  if (!user) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});
  
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
  



