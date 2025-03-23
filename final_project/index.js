const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use(session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}));

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.use("/customer/auth/*", function auth(req, res, next){
    const token = req.header("Authorization")?.split(" ")[1] || req.session.token;
    console.log("Token received:", token);

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    jwt.verify(token, "secret_key", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        console.log("Authenticated user:", user);
        req.user = user || req.session.user; //Store user data in request
        console.log("Request user now contains:", req.user);
        next();
    });
});
 
const PORT =5001;

app.listen(PORT,()=>console.log("Server is running"));
