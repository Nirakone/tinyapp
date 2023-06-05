const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");
app.use(cookieParser());


function generateRandomString() {
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * possibleChars.length);
    randomString += possibleChars.charAt(randomIndex);
  }
  return randomString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

const users = {
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
  const templateVars = { urls: urlDatabase, user: req.cookies.user_id };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  
  const templateVars = {
    user: req.cookies["user_id"],
    
  };
  res.render("urls_new", templateVars);
});


app.get("/register",(req,res)=> {
  res.render("urls_register");
});
  
app.post("/register",(req,res) => {

  const userID = generateRandomString(10);
  const { email, password } = req.body;
  
  const newUser = {
    id: userID,
    email: email,
    password: password
  };
  
  users[userID] = newUser;
  
  res.cookie("user_id", userID);
  
  res.redirect("/urls");
});
  


app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  const newId = generateRandomString();
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const urlID = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[urlID] = newURL;
  res.redirect("/urls");
});

app.post("/login",(req,res) => {
  console.log(req.body);
  //res.cookie("username",req.body.username);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"],
    
  };
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", [null]);
  res.redirect("/urls");
});