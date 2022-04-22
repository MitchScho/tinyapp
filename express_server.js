const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const PORT = 8080;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// set the view engine to ejs
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
  
  //If the e-mail or password are empty strings, send back a response with the 400 status code.
  if (!email || !password) {
    return res.status(400).send("Please enter valid inputs!");
  }
  
  //If someone tries to register with an email that is already in the users object,
  if (findUserByEmail(email)) {
    return res.status(403).send("SORRY: This email has already been used")
  }
  
  const id = generateRandomString(4);
  
  const user = {
    id: id,
    email: email,
    password: password,
  };
  users[id] = user;

  //res.cookie("userId", user.id);
  res.redirect("/login");
});
  
  
const findUserByEmail = function (email) {
  
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return users[userId]; // user found return user object
    }
  }
  return null; //user not found
};

    
// POST req for user login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);

  if (!user) {
    return res.status(403).send(`SORRY: Could not find a user with the email ${email}`);
  }
  if (user.password !== password) {
    return res.status(403).send("SORRY: This password information is invalid");
  }
  
    res.cookie("userId", user.id);
    res.redirect("/urls");
  });

//POST request for Logout
app.post("/logout", (req, res) => {
  //const user = req.cookies.userId ;
  res.clearCookie("userId");
  res.redirect("/login");
});

//POST route that removes a URL by accessing shortURL key
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;//access shortURL with req.params.shortURL
  delete urlDatabase[shortURL];//delete from data base by using delete and acessing shortURL key with bracket notation
  res.redirect("/urls");
});

// POST request from client to edit URLs
app.post("/urls/:id", (req, res) => {
  //rq.params.id is the data that comes from the input form. It's accessed and assigned to the newShortURL variable
  const newShortUrl = req.params.id;
  //Then the newShortURL is used to update the req.body.longURL which is the edited URL from the client. All is updated on the database
  urlDatabase[newShortUrl].longURL = req.body.longURL;
  const userID = req.cookies.userId;
  const loggedInUserUrls = urlsForUserId(urlDatabase, userID);
    if (!userID || !loggedInUserUrls) {
      return res.status(401).send("SORRY: You must be logged in!");
    }
  res.redirect(`/urls/${newShortUrl}`);
});
  

//Post to urls page where list of urls with their shortURL keys is looped over and displayed
app.post("/urls", (req, res) => {
  
  const userID = req.cookies.userId;
  
  if (!userID) {
    return res.status(401).send("SORRY: You must be logged in to add new url!");
  }
  const longURL = req.body.longURL;
  let newShortUrl = generateRandomString(6); // var  newShortUrl is given the value generated by the randomString func
  urlDatabase[newShortUrl] = { userID , longURL } ; //urlDatabase is updated by assigning the value of req.body.longURL (the long url path)to the newShortUrl key
  
  res.redirect(`/urls/${newShortUrl}`); // Redirects to /urls/with the new short url value displayed
});

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateRandomString = function (length) {
  let result = "";
  const charactersLength = characters.length;

  //For loop is used to loop through the number passed into the generateRandomString() function
  //During each iteration, a random character is generated.
  for (let i = 0; i < length; i++) {
    //Math.random() method is used to generate random characters from the specified characters var
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

//Get request for register file
app.get("/register", (req, res) => {
  const loggedInUser = req.cookies.userId;
  const templateVars = { user: users[loggedInUser] };
  res.render("register", templateVars);
});

//Get request for login file
app.get("/login", (req, res) => {
  const loggedInUser = req.cookies.userId;
  const templateVars = { user: users[loggedInUser] };
  res.render("login", templateVars);
});

//Loops through database and finds shortURL objects that match the logged in user
  const urlsForUserId = function (database, userId) {
    const loggedInUserUrls = {};

    for (let shortURL in database) {
      if (database[shortURL].userID === userId) {
        loggedInUserUrls[shortURL] = database[shortURL];
      }
    }
    return loggedInUserUrls;
  };


//Get page /urls where list of urls is looped over and displayed
app.get("/urls", (req, res) => {
  const loggedInUser = req.cookies.userId;
  if (!loggedInUser) {
    res.status(401).send("Please login to access Tinyapp.");
  }

  const urlsForUser = urlsForUserId(urlDatabase, loggedInUser);
  const templateVars = { urls: urlsForUser, user: users[loggedInUser] };
  
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {

  const loggedInUser = req.cookies.userId;
  if (!loggedInUser) {
    res.redirect("/login");
  }
  // if (user.password !== password) {
  //   return res.status(403).send("SORRY: This password information is invalid");
  // }
  const templateVars = { user: users[loggedInUser] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const loggedInUser = req.cookies.userId;
  const templateVars = { shortURL, longURL, user: users[loggedInUser] };
  
  res.render("urls_show", templateVars );
});
  

//Get new route for shortURL requests. Where it redirects to the corresponding longURL
app.get("/u/:shortURL", (req, res) => {
  console.log("url database", urlDatabase);
  const longURL =  urlDatabase[req.params.shortURL].longURL;
  if (!longURL) {
    res.status(401).send("Sorry: Incorrect URL");
  }
  res.redirect(longURL);
});
  

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


