const express = require("express");
const app = express();

const PORT = process.env.PORT || 8080;

app.get("/api/*", (req , res) => {
  res.status(200).json({ok: true})
})

app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`)
})

module.exports = {app}