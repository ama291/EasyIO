var express = require("express");
var app = express();
var port = 8888;
var path = require('path');

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "ide.html"));
});

app.get("/compiler.js", function(req, res){
    res.sendFile(path.join(__dirname, "compiler.js"));
});

app.listen(process.env.PORT || port);
console.log("Server started on port " + port);
console.log("Server started on port (heroku) " + process.env.PORT);
