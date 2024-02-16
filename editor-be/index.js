const express = require("express");
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");

const cors = require("cors");
require("./socket/server").socket()

mongoose
  .connect("mongodb://127.0.0.1:27017/settyl_data")
  .then(() => console.log("mongo Connected!"));

const UsersModel = require("./models/Users");
const DocsModel = require("./models/docs");
const { accessControl } = require("./middleware");
const socketClient = require("./socket/client")

const app = express();
app.use(express.json());
app.use(cors());

app.get("/start", (req, res) => {
  res.send("Working");
});

app.post("/signup", (req, res) => {
  UsersModel.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        throw { message: "User Already Exists", status: 400 };
      }
      return UsersModel.create(req.body);
    })
    .then((emp) => {
      res.json(emp);
    })
    .catch((err) => res.status(err.status).send(err));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  UsersModel.findOne({ username: username, password: password })

    .then((emp) => {
      if (!emp) {
        throw { message: "User Does Not Exists", status: 400 };
      }
      emp = emp.toJSON();
      var token = jwt.sign(emp, "shhhhh");
      emp.token = token;
      res.json(emp);
    })
    .catch((err) => res.status(err.status).send(err));
});

app.post("/doc/add", accessControl, (req, res) => {
  const user = req.user;

  const { name, text } = req.body;
  DocsModel.findOne({ name: name })

    .then (async (data) => {
      if (data) {
        let res = await DocsModel.updateOne({name: name},  {text: text});
        console.log("res", res)
        const event = {
            _id: data._id,
            text: text
        }
        socketClient.emitEvent(event)
        return {};
      }
      const doc = {
        name: name,
        ownerId: user._id.toString(),
        user: [],
        text: text,
      };
      return DocsModel.create(doc);
    })
    .then((emp) => {
      res.json(emp);
    })
    .catch((err) => res.status(err.status || 500).send(err));
});

app.get("/doc/details/:name", accessControl, (req, res) => {
  const user = req.user;

  const { name } = req.params;

  DocsModel.findOne({ name: name })
    .then((data) => {
      if (!data) {
        throw { message: "Invalid Doc", status: 400 };
      }
      const doc = data.toJSON();

      const users = doc.users;

      if (
        doc.ownerId !== user._id.toString() &&
        users.indexOf(user._id.toString()) < 0
      ) {
        throw { message: "Not Permitted to access this doc", status: 400 };
      }

      res.json(data);
    })
    .catch((err) => res.status(err.status || 500).send(err));
});


app.listen(3002, () => {
  console.log("server is running on: " + "3002");
});
