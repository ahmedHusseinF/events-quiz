const EventEmitter = require("events");
var express = require("express");
var bodyParser = require("body-parser");

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const flag = "🎉🎉APT_ROCKS🎉🎉";
let stillOn = true;
let winner = "";

app.get("/", (_, res) => {
  res.status(200).sendFile("index.html", { root: __dirname });
});

app.post("/submit", (req, res) => {
  const { code, name } = req.body;

  if (!stillOn)
    return res.status(400).json({ error: `${winner} already won 😔` });

  if (typeof code !== "string")
    return res.status(400).json({ error: "didn't send correctly" });

  const isMalicous = [
    "process",
    "global",
    "require",
    "promise",
    "express",
    "winner",
    "flag",
    "this"
  ].some(token => {
    return code.includes(token);
  });

  if (isMalicous) {
    return res
      .status(400)
      .json({ error: `STAAAHP ✋✋✋, no candies for you 😠` });
  }

  let did_emit = false;
  let did_listen = false;

  let apt = new EventEmitter();

  apt.on("apt_event", () => {
    did_emit = true;
  });

  eval(code);

  apt.emit("custom_event");

  if (did_emit && did_listen) {
    winner = name;
    stillOn = false;
    return res.status(200).json({ flag });
  } else {
    return res.status(400).json({ error: "Failed attempt, try again quickly" });
  }
});

app.get("/reset", () => {
  winner = "";
  stillOn = true;
});

app.get("/winner", (_, res) => {
  res.status(200).end(winner);
});

module.exports = exports = app;
