const { assert } = require("chai");

const { getUserByEmail, getUrlsForUserId } = require("../helpers.js");

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    
    assert.deepEqual(user.id, expectedUserID);
  });
  it("should return undefined if the email passed in is not in the database", function() {
    const user = getUserByEmail("user@failexample.com", testUsers);
    
    assert.deepEqual(user, undefined);
  });
});

describe("getUrlsForUserId", function() {
  //if user found return user object(urls of the user)
  it("should return urls for a given user", function() {
    const user = getUrlsForUserId("userRandomID", testUrlDatabase);
    const expectedUrls = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "userRandomID",
      },
    };
    
    assert.deepEqual(user, expectedUrls);
  });
  //If user not found return emty object
  it("If user not found should return emty object", function() {
    const user = getUrlsForUserId("userRandomWrongID", testUrlDatabase);

    assert.deepEqual(user, {});
  });
});
