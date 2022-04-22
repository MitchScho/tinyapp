//Loops through user database and checks if the input email matches one in the database
const getUserByEmail = function(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user; // user found return user object
    }
  }
  return undefined; //user not found
};

//Loops through  URL database and finds shortURL objects that match the logged in user
const getUrlsForUserId = function(userId, database) {
  const loggedInUserUrls = {};

  for (let shortURL in database) {
    if (database[shortURL].userID === userId) {
      loggedInUserUrls[shortURL] = database[shortURL];
    }
  }
  return loggedInUserUrls; // urls found that match the logged in user
};

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//Generates random string for userID and shortURLs
const generateRandomString = function(length) {
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
    


module.exports = { getUserByEmail, generateRandomString, getUrlsForUserId };