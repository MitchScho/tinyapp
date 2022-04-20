const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.use(bodyParser.urlencoded({ extended: true }));

// set the view engine to ejs
app.set('view engine', 'ejs');

//Get request for route file
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Get page /urls where list of urls is looped over and displayed
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//POST route that removes a URL by accessing shortURL key
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;//access shortURL with req.params.shortURL
  delete urlDatabase[shortURL];//delete from data base by using delete and acessing shortURL key with bracket notation
  res.redirect("/urls");
});
// POST request from client end
app.post("/urls/:id", (req, res) => {
  //rq.params.id is the data that comes from the input form. it's accessed and assigned to the newShortURL variable
  const newShortUrl = req.params.id
  //Then the newShortURL is used to update the req.body.longURL which is the edited URL from the client. all is updated on the database 
  urlDatabase[newShortUrl] = req.body.longURL;
  res.redirect(`/urls/${newShortUrl}`);
  
});

//Post to urls page where list of urls with their shortURL keys is looped over and displayed
app.post("/urls", (req, res) => {

  let newShortUrl = generateRandomString(6); // var  newShortUrl is given the value generated by the randomString func
  urlDatabase[newShortUrl] = req.body.longURL; //urlDatabase is updated by assigning the value of req.body.longURL (the long url path)to the newShortUrl key
  
  res.redirect(`/urls/${newShortUrl}`); // Redirects to /urls/with the new short url value displayed
})

app.get("/urls/:shortURL", (req, res) => {

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
 
  res.render("urls_show", templateVars);
  
});

//Get new route for shortURL requests. Where it redirects to the corresponding longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL =  urlDatabase[req.params.shortURL];
  
  res.redirect( longURL);
  
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


const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateRandomString(length) {

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