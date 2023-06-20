const { assert } = require('chai');

const getUserByEmail  = require('../helpers.js');
// console.log(getUserByEmail);

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here

    assert.equal(user.id,expectedUserID);

  });
});


it(`should return undefined if email not there`, () => {
  const user = getUserByEmail("invalid@email.com", testUsers);
  assert.isUndefined(user);
});
