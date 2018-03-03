const express = require("express");
const app = express();
const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config');

const PORT = process.env.PORT || 8080;

// CORS
app.use(
  cors({
      origin: CLIENT_ORIGIN
  })
);

app.get("/api/user/*", (req , res) => {
  res.status(200).json({ok: true})
})

app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`)
})

module.exports = {app}