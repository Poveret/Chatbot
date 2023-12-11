const express = require("express");
const request = require("request");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const User = require("./schemas/user.schema.js");
const Chat = require("./schemas/chats.schema.js");
require("dotenv").config();

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

    const app = express();
    const port = 3000;

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
          console.error("Error guardando: " + err);
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

      user.session_token = token;

      user.save().catch((err) => {
        console.error("Error actualizando token de usuario: " + err);
      });

      const chats = await Chat.find({ user: user._id });

      res.json({ session_token: token, chats: chats.map((x) => x.uuid) });
    });

    app.put("/api/user", async (req, res) => {
      const { user_session } = req.body;

      if (!user_session) {
        res.json({ error: "Error" });
      } else {
        try {
          const user = await User.findOne({
            session_token: user_session,
          });

          if (!user) {
            res.json({ error: "Error usuario no reconocido" });
            return;
          }

          let { weight, height, imc } = req.body;

          if (!weight || !height || !imc) {
            res.json({ error: "Datos incompletos" });
            return;
          }

          user.weight = weight;
          user.height = height;
          user.imc = imc;

          user
            .save()
            .then(() => {
              res.json({ message: "Guardado" });
            })
            .catch((err) => {
              res.json({ error: "Error" });
            });
        } catch {
          res.json({ error: "Error" });
        }
      }
    });

    app.post("/api/islogged", authenticateToken, (req, res) => {
      res.json({ isLogged: true });
    });

    app.post("/api/question", async (req, res) => {
      const { question, user_session } = req.body;
      let { uuid } = req.body;

      if (!user_session) {
        res.json({ error: "Error" });
      } else {
        try {
          const user = await User.findOne({
            session_token: user_session,
          });

          if (!user) {
            res.json({ error: "Error usuario no reconocido" });
            return;
          }

          let chat;

          if (!uuid) {
            uuid = uuidv4();

            const prompt =
              "Actúa como nutricionista virtual y proporcione planes de alimentación personalizados a los usuarios. " +
              "Debes ser capaz de recopilar información sobre la edad, el género, la altura, el peso, el nivel de actividad física " +
              "y los objetivos de cada usuario. A partir de esta información, la IA debe ser capaz de calcular las necesidades calóricas diarias de cada usuario " +
              "y diseñar un plan de alimentación equilibrado que incluya los nutrientes necesarios para alcanzar sus objetivos. " +
              "La IA debe ser capaz de proporcionar opciones de alimentos saludables y sugerencias de recetas para cada comida del día, " +
              "así como adaptar el plan de alimentación a las preferencias alimentarias y restricciones dietéticas de cada usuario. " +
              "Además, la IA debe ser capaz de realizar un seguimiento del progreso de cada usuario y ajustar el plan de alimentación según sea necesario " +
              "para garantizar que se alcancen los objetivos de manera segura y efectiva." +
              "Si das una receta, pon al lado de cada ingrediente las calorías que corresponden." +
              (user.imc
                ? ` El índice de masa corporal del usuario que pregunta es de ${user.imc}.`
                : "") +
              " Puedes utilizar formato html para que se vea mejor";

            const firstPrompt = new Promise((resolve, reject) =>
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
                    uuid,
                    message: { role: "user", content: prompt },
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
                  resolve();
                }
              )
            );

            await firstPrompt;

            const summary = new Promise((resolve, reject) =>
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
                    uuid: uuid + "x",
                    message: {
                      role: "user",
                      content:
                        "Hazme un resumen de no mas de 5 palabras de este texto, elige solo palabras claves, el formato será @palabra1#palabra2#palabra3..., este es el texto: " +
                        question,
                    },
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
                  let input = body.content.replace(/AI##/g, "");
                  const tagsString = input.substring(input.indexOf("@") + 1);
                  const tagsArray = tagsString.split("#");
                  let summary = tagsArray.join(" ");

                  if (tagsArray.length <= 1) {
                    summary = question.split(" ").slice(0, 4);
                    summary = summary.join(" ");
                  }

                  chat = new Chat({
                    uuid,
                    date: new Date(),
                    user: user._id,
                    summary,
                    messages: [],
                  });

                  resolve();
                }
              )
            );

            await summary;
          } else {
            chat = await Chat.findOne({
              uuid,
            });
          }

          chat.messages.push(question);

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
                uuid,
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
                formattedAnswer = body.content.replace(/AI##/g, "");
                chat.messages.push(formattedAnswer);

                chat
                  .save()
                  .then(() => {
                    res.json({
                      content: formattedAnswer,
                      uuid,
                      summary: chat.summary,
                    });
                  })
                  .catch((err) => {
                    res.json({ error: "Error" });
                  });
              }
            }
          );
        } catch {
          res.json({ error: "Error" });
        }
      }
    });

    app.post("/api/getChats", async (req, res) => {
      const { user_session } = req.body;

      if (!user_session) {
        res.json({ error: "No hay sesión de usuario" });
        return;
      }

      const user = await User.findOne({
        session_token: user_session,
      });

      if (!user) {
        res.json({ error: "Error al cargar el usuario" });
        return;
      }

      const chats = await Chat.find({
        user: user._id,
      });

      res.json(
        chats.map((x) => ({
          uuid: x.uuid,
          summary: x.summary,
        }))
      );
    });

    app.post("/api/user", async (req, res) => {
      const { user_session } = req.body;

      if (!user_session) {
        res.json({ error: "No hay sesión de usuario" });
        return;
      }

      const user = await User.findOne({
        session_token: user_session,
      });

      if (!user) {
        res.json({ error: "Error al cargar el usuario" });
        return;
      }

      res.json({ weight: user.weight, height: user.height });
    });

    app.post("/api/getChat/:uuid", async (req, res) => {
      const { user_session } = req.body;

      if (!user_session) {
        res.json({ error: "No hay sesión de usuario" });
        return;
      }

      const user = await User.findOne({
        session_token: user_session,
      });

      if (!user) {
        res.json({ error: "Error al cargar el usuario" });
        return;
      }

      const chat = await Chat.findOne({
        user: user._id,
        uuid: req.params.uuid,
      });

      res.json(chat);
    });

    app.delete("/api/getChat/:uuid", async (req, res) => {
      const { user_session } = req.body;

      if (!user_session) {
        res.json({ error: "No hay sesión de usuario" });
        return;
      }

      const user = await User.findOne({
        session_token: user_session,
      });

      if (!user) {
        res.json({ error: "Error al cargar el usuario" });
        return;
      }

      const chats = await Chat.findOne({
        user: user._id,
        uuid: req.params.uuid,
      });

      chats
        .deleteOne()
        .then(() => {
          res.json({ message: "Eliminado" });
        })
        .catch((error) => {
          res.json({ error });
        });
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "..", "public", "index.html"));
    });

    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  });
