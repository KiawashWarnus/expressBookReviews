const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  return users.some(user => user.username === username);
};

const authenticatedUser = (username,password)=>{
  return users.some(user => user.username === username && user.password === password);
};

regd_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password){
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(400).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  console.log("Session after login:", req.session);
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const accessToken = jwt.sign({ username }, "secret_key", { algorithm: "HS256", expiresIn:"2h" });
  req.session.token = accessToken;
  req.session.user = { username };
  return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  console.log("Incoming request to add/update review.");
  console.log("Request user:", req.user);

  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully" });
});

regd_users.delete("/auth/review/:isbn", (req,res) => {
  const isbn = req.params.isbn;
  console.log("Deleting review for ISBN:", isbn);
  const username = req.user.username;
  if (!books[isbn] || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
