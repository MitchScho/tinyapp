const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const PORT = 8080;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// set the view engine to ejs
app.set('view engine', 'ejs');

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {};

//POST request for user to register input information
app.post("/register", (req, res) => {
  const id = generateRandomString(4);
  const email = req.body.email;
  const password = req.body.password;
  const user = {
    id: id,
    email: email,
    password: password,
  };
  users[id] = user;

  //If the e-mail or password are empty strings, send back a response with the 400 status code.
  if (!email || !password) {
    return res.status(400).send("Please enter valid inputs!");
  }
  const emailLookUp = function () {
    
    for (const userId in users) {
      const user = users[userId];
      if (user.email === email) {
        return true //email is already in database
      }
    } 
    return false;// email is new and can be input/used
  }
  
  //If someone tries to register with an email that is already in the users object,
  if (emailLookUp()) {
    return res.status(400).send("SORRY: This email has already been used")
  }

  res.cookie("userId", user.id);
  res.redirect("/urls");
});

// POST req for user login
app.post("/login", (req, res) => {
  const loggedUserCookie = req.cookies.userId;
  const user = loggedUserCookie;
  console.log("loggedUserCookie, loggedUserCookie");
  console.log("user", user)
  res.cookie("userId", user.id);
  res.redirect("/urls");
});

//POST request for Logout
app.post("/logout", (req, res) => {
  const user = req.cookies.userId ;
  res.clearCookie("userId", user.id);
  res.redirect("/urls");
});

//POST route that removes a URL by accessing shortURL key
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;//access shortURL with req.params.shortURL
  delete urlDatabase[shortURL];//delete from data base by using delete and acessing shortURL key with bracket notation
  res.redirect("/urls");
});

// POST request from client end to edit URLs
app.post("/urls/:id", (req, res) => {
  //rq.params.id is the data that comes from the input form. it's accessed and assigned to the newShortURL variable
  const newShortUrl = req.params.id;
  //Then the newShortURL is used to update the req.body.longURL which is the edited URL from the client. all is updated on the database
  urlDatabase[newShortUrl] = req.body.longURL;
  
  res.redirect(`/urls/${newShortUrl}`);
});
  

//Post to urls page where list of urls with their shortURL keys is looped over and displayed
app.post("/urls", (req, res) => {
  
  let newShortUrl = generateRandomString(6); // var  newShortUrl is given the value generated by the randomString func
  urlDatabase[newShortUrl] = req.body.longURL; //urlDatabase is updated by assigning the value of req.body.longURL (the long url path)to the newShortUrl key
  
  res.redirect(`/urls/${newShortUrl}`); // Redirects to /urls/with the new short url value displayed
});

//Get request for route file
app.get("/register", (req, res) => {

  res.render("register");
});

//Get page /urls where list of urls is looped over and displayed
app.get("/urls", (req, res) => {
  const loggedUserCookie = req.cookies.userId;
  const templateVars = { urls: urlDatabase, users, loggedUserCookie };
  res.render("urls_index", templateVars);
  console.log("cookies", req.cookies);
});

app.get("/urls/new", (req, res) => {
  const loggedUserCookie = req.cookies.userId;
  const templateVars = { users, loggedUserCookie };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  const loggedUserCookie = req.cookies.userId;
  const templateVars = { shortURL, longURL, users, loggedUserCookie };
  res.render("urls_show", templateVars );
});
  

//Get new route for shortURL requests. Where it redirects to the corresponding longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL =  urlDatabase[req.params.shortURL];
  
  res.redirect(longURL);
});
  






// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// })

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const generateRandomString = function(length) {

  let result = " ";
  const charactersLength = characters.length;

  //For loop is used to loop through the number passed into the generateRandomString() function
  //During each iteration, a random character is generated.
  for (let i = 0; i < length; i++) {

    //Math.random() method is used to generate random characters from the specified characters var
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};