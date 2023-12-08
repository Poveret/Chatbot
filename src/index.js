const express = require("express");
const request = require("request");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const generateAccessToken = (username) => {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: "30 days" });
};

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (token == null) return res.json({ isLogged: false });

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.json({ isLogged: false });
    req.user = user;
    next();
  });
};

const User = require("./schemas/user.schema.js");

require("dotenv").config();

const app = express();
const port = 3000;

mongoose
  .connect(
    `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${
      process.env.DBURL ? process.env.DBURL : "localhost"
    }:27017`,
    {
      dbName: "app",
    }
  )
  .then(() => {
    console.log("Conectado a la base de datos");

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(
      "/assets",
      express.static(path.join(__dirname, "..", "public", "assets"))
    );

    app.post("/api/register", async (req, res) => {
      if (!req.body.username || !req.body.password) {
        res.json({ error: "Datos incompletos" });
        return;
      }

      let user = await User.findOne({ username: req.body.username });
      if (user) {
        res.json({ error: "Este usuario ya existe" });
        return;
      }

      const hash_password = crypto
        .createHash("sha256")
        .update(req.body.password)
        .digest("hex");

      const token = generateAccessToken({
        username: req.body.username + hash_password,
      });

      const newUser = new User({
        username: req.body.username,
        password: hash_password,
        session_token: token,
      });

      newUser
        .save()
        .then(() => {
          console.log(`Nuevo usuario: "${newUser.username}"`);
        })
        .catch((err) => {
          console.log("Error guardando: " + err);
        });

      res.json({ session_token: token });
    });

    app.post("/api/login", async (req, res) => {
      if (!req.body.username || !req.body.password) {
        res.json({ error: "Datos incompletos" });
        return;
      }

      let user = await User.findOne({
        username: req.body.username,
        password: crypto
          .createHash("sha256")
          .update(req.body.password)
          .digest("hex"),
      });
      if (!user) {
        res.json({ error: "Usuario o contraseña incorrectos" });
        return;
      }

      const token = generateAccessToken({
        username: req.body.username + user.password,
      });

      res.json({ session_token: token });
    });

    app.post("/api/islogged", authenticateToken, (req, res) => {
      res.json({ isLogged: true });
    });

    app.post("/api/question", async (req, res) => {
      const { question } = req.body;

      request(
        {
          method: "POST",
          url: process.env.URL_AI,
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.API_KEY,
          },
          body: {
            model: "gpt-35-turbo-0301",
            uuid: "aasdasdsad", // uuidv4()
            message: { role: "user", content: question },
            index: "",
            type: "",
            temperature: 0,
            origin: "escueladata",
            plugin_id: "",
            prompt_externo: "",
            tokens: 3000,
            folder: "root",
          },
          json: true,
        },
        (error, response, body) => {
          if (error) throw new Error(error);
          if (body.error) {
            res.json({ error: body.message });
          } else {
            res.json({ content: body.content });
          }
        }
      );
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "..", "public", "index.html"));
    });

    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  });
