const express = require('express');

const app = express();

const users = require('./routers/users.js');
const posts = require('./routers/posts.js');

const cookieParser = require('cookie-parser');

app.use(cookieParser("thisismysecret"));


app.get("/getsignedcookies", (req, res) => {
    res.cookie("fruit", "mango", {signed: true});
    res.send("sent you some signed cookies");
});

app.get("/verify", (req, res) => {
    console.log(req.signedCookies);
    res.send("verified");
});

app.get("/getcookies", (req, res) => {
    res.cookie("greet", "helo");
    res.send("sent you some cookies");
});

app.get("/geet", (req, res) => {
    let{name="anonymous"} = req.query;
    res.send(`Hello ${name}`);
});

app.get("/", (req, res) => {
    console.dir(req.cookies);
    res.send("Hi I am root!");
});

app.use("/users", users);
app.use("/posts", posts);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});