const express = require('express');
const axios = require('axios');
const books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//Register a new user
public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list using Promise
public_users.get('/', (req, res) => {
  new Promise((resolve) => {
    resolve(books);
  }).then((bookList) => {
    res.status(200).json({ books: bookList });
  }).catch(() => {
    res.status(500).json({ message: "Error retrieving book list" });
  });
});

// Get the book list using async-await with Axios
public_users.get('/async-books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5001/');
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book list" });
  }
});

// Get book details based on ISBN using Promise
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("book not found");
    }
  }).then((book) => {
    res.status(200).json(book);
  }).catch((err) => {
    res.status(404).json({ message: err });
  });
 });

 // Get book details based on ISBN using async-await with Axios
 public_users.get('/async-isbn/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const response = await axios.get('http://localhost:5001/isbn/$(isbn)');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author using Promise
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  new Promise((resolve) => {
    const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author);
    resolve(filteredBooks);
  }).then((filteredBooks) => {
    if (filteredBooks.length > 0) {
      res.status(200).json(filteredBooks);
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  });
});

// Get book details based on author using async-await with Axios
public_users.get('/async-author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const response = await axios.get('http://localhost:5001/author/${author}');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title using Promise
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  new Promise((resolve) => {
    const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() === title);
    resolve(filteredBooks);
  }).then((filteredBooks) => {
    if (filteredBooks.length > 0) {
      res.status(200).json(filteredBooks);
    } else {
      res.status(404).json({ message: "No books found for this title" });
    }
  });
});

// Get book details based on title using async-await with Axios
public_users.get('/async-title/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const response = await axios.get('http://localhost:5001/title/${title}');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: "No books found for this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
