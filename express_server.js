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

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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
  if (!templateVars.user) {
    return res.status(403).send(`Status code: ${res.statusCode} - ${res.statusMessage}. To see urls, log in or register.`);
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/register",(req,res)=> {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_register");
  }
});
  
app.post("/register",(req,res) => {

  const userID = generateRandomString(10);
  const { email, password } = req.body;
    users[userID] = {
    id: userID,
    email: email,
    password: password
  };
  
  res.cookie("user_id", userID);
  
  if (!email || !password) {
    res.status(400).send("Email or password cannot be empty.");
    return;
  }

  const alreadyUser = Object.values(users).find(user => user.email === email);
  if (alreadyUser) {
    res.status(400).send("Email is already registered.");
    return;
  }
  res.redirect("/urls");
});



app.get("/login", (req,res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: req.cookies.user_id,
      urls: urlDatabase,
    };
   res.render("urls_login", templateVars);
}
});

app.post("/login",(req,res) => {
  const {email, password} = req.body;

  const userExists = (email) => {
    for (const userID in users) {
      const user = users[userID];
      if (user.email === email) {
        return user;
      }
    }
    return null;
  };
  
  const findPassword = (password) => {
    for (const userID in users) {
      const user = users[userID];
      if(user.password === password) {
        return user;
      }
    }
    return null;
  };

  if (!email || !password) {
    return res.status(400).send('Invalid');

  } else if (!userExists(email)) {
    return res.status(403).send("User does not exist.");

  } else if (!findPassword(password)) {
    return res.status(403).send("Incorrect password");
  }

  const user = userExists(email);
  res.cookie("url_id",user.id);
  res.redirect("/urls");
});



app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]["longUrl"] };
  if (!req.cookies["user_id"]) {
    return res.status(403).send(`Status code: ${res.statusCode} - ${res.statusMessage} Log in or register.`);
  }
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(403).send("Non existent");
  }
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  // //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  // const newId = generateRandomString();
  // urlDatabase[newId] = req.body.longURL;
  // res.redirect(`/urls/${newId}`);
  if (!req.cookies.user_id) {
    res.status(401).send("You must be logged in to shorten URLs.");
  } else {
    const newId = generateRandomString();
    urlDatabase[newId] = req.body.longURL;
    res.redirect(`/urls/${newId}`);
  }
});


app.get("/u/:id", (req, res) => {
  const loadLongURL = urlDatabase[req.params.id]["longUrl"];
  if (loadLongURL) {
    res.redirect(loadLongURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const urlID = req.params.id;
  const user = req.cookies.user_id;

  if (!user) {
    res.status(403).send(`Status code: ${res.statusCode} - ${res.statusMessage}. Denied. Log in or register`);
  } else if (!urlDatabase[urlID]) {
    res.status(404).send(`Status code: ${res.statusCode} - ${res.statusMessage}. Non existent`);
  } else if (urlDatabase[urlID]["userID"] !== user["id"]) {
    res.status(403).send(`Status code: ${res.statusCode} - ${res.statusMessage}. Not permitted`);
  } else {
    delete urlDatabase[urlID];

  res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  const urlID = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[urlID] = newURL;
  res.redirect("/urls");
});

// app.post("/login",(req,res) => {
//   console.log(req.body);
//   //res.cookie("username",req.body.username);
//   res.redirect("/urls");
// });

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