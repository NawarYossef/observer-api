const express = require("express");
const app = express();
// const cors = require('cors');
// const {CLIENT_ORIGIN} = require('./config');

const PORT = process.env.PORT || 8080;

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  next();
});

app.get("/api/user/*", (req , res) => {
  res.send("hi")
})

app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`)
})

module.exports = {app}