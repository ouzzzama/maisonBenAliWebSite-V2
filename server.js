const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  if (req.path.endsWith('/index.html')) {
    res.redirect(301, req.path.slice(0, -10) || '/');
  } else if (req.path.endsWith('.html')) {
    res.redirect(301, req.path.slice(0, -5));
  } else {
    next();
  }
});

app.use(express.static(__dirname, { extensions: ["html"] }));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

