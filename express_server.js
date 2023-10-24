const express = require("express");
const cookieSession = require('cookie-session');

const app = express();
const bcrypt = require("bcryptjs");
const getUserByEmail = require("./helpers");


const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['keyOne'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
})
);

function generateRandomString() {
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * possibleChars.length);
    randomString += possibleChars.charAt(randomIndex);
  }
  return randomString;
};


//hard coded urls default

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


//hard coded users and passwords to test
const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("a",10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function urlsForUser(id) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.use(express.urlencoded({ extended: true }));


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {


  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send("Please log in or register.");
  }
  console.log("userID is" ,userId);
  const userURLs = urlsForUser(userId);
  const templateVars = {
    urls: userURLs,
    user: users[userId]
  
  };
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/register",(req,res)=> {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
  
    res.render("urls_register", {user: null});
  }
});
  
app.post("/register",(req,res) => {

  const userID = generateRandomString(10);

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send("Email or password cannot be empty.");
    return;
  }

  const alreadyUser = getUserByEmail(email, users);
  if (alreadyUser) {
    res.status(400).send("Email is already registered.");
    return;
  }

  const hashedPassword = bcrypt.hashSync(password,10);
  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };
  
  
  req.session.user_id = userID;
  
  res.redirect("/urls");
});



app.get("/login", (req,res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: req.session.user_id,
      urls: urlDatabase,
    };
   res.render("urls_login", templateVars);
}
});

app.post("/login",(req,res) => {
  const {email, password} = req.body;
  const user = getUserByEmail(email, users);

  const hashedPassword = bcrypt.hashSync(password, 10);

  

  if (!email || !password) {
    return res.status(400).send('Invalid');
  } else if (!user) {
    return res.status(403).send("User does not exist.");
  } else if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});


app.get("/urls/:id", (req, res) => {
  if (!req.session["user_id"]) {
    return res.status(403).send(`Status code: ${res.statusCode} - ${res.statusMessage} Log in or register.`);
  }
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(404).send("Non existent");
  }

  const userId = req.session.user_id;
  const templateVars = {
    user: users[userId],
    url: urlDatabase[id],
    id: id,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {

  if (!req.session.user_id) {
    res.status(401).send("You must be logged in to shorten URLs.");
  } else {
    const newId = generateRandomString();
    urlDatabase[newId] = {
      longURL:req.body.longURL,
      userID: req.session.user_id};
    res.redirect(`/urls/${newId}`);
  }
});


app.get("/u/:id", (req, res) => {
  const loadLongURL = urlDatabase[req.params.id].longURL;
  if (loadLongURL) {
    res.redirect(loadLongURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const urlID = req.params.id;
  const user = users[req.session.user_id];

  if (!user) {
    res.status(403).send(`Denied. Log in or register`);
  } else if (!urlDatabase[urlID]) {
    res.status(404).send(`Non existent`);
  } else if (urlDatabase[urlID]["userID"] !== user["id"]) {

    res.status(403).send(`Not permitted`);
  } else {
    delete urlDatabase[urlID];

  res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];

  const urlID = req.params.id;
  const newURL = req.body.longURL;

  if (!user) {
    res.status(403).send(`Denied. Log in or register`);
  } else if (!urlDatabase[urlID]) {
    res.status(404).send(`Non existent`);
  } else if (urlDatabase[urlID]["userID"] !== user["id"]) {

    res.status(403).send(`Not permitted`);
  }

  urlDatabase[urlID].longURL = newURL;
  console.log("urlsafter", urlDatabase);

  

  res.redirect("/urls");
});



app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/register");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/register");
});