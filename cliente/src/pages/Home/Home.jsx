import { Link } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import {
  apiUrl,
  toastDefaultSettings,
  useCheckIfUserLogged,
} from "../../utils.js";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";

const Home = () => {
  const [isUserLogged, setIsUserLogged] = useState(0);
  useCheckIfUserLogged(setIsUserLogged);

  const [chatMessages, setChatMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const formRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [chatSelected, setChatSelected] = useState("");

  const [cookies] = useCookies(["user_session"]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const loadChatMessages = async (event) => {
    if (event.uuid) {
      let response = await fetch(apiUrl(`/getChat/${event.uuid}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_session: cookies.user_session,
        }),
      });

      if (response.ok) {
        const message = await response.json();

        if (message.error) {
          toast.error(message.error, toastDefaultSettings);
        } else {
          setChatSelected(message.chats.uuid);
          setChatMessages([]);

          setTimeout(async () => {
            const newElements = message.chats.messages.map((question) => (
              <div className="chat-message chat-message-initial-state">
                {question}
              </div>
            ));

            for (const element of newElements) {
              setChatMessages((prev) => [...prev, element]);
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }, 100);
        }
      } else {
        toast.error(
          "No se ha podido conectar con el servidor",
          toastDefaultSettings
        );
      }
    } else {
      setChatSelected("");
      setChatMessages([]);
    }
  };

  useEffect(() => {
    window.addEventListener("chatsLoad", loadChatMessages);

    return () => {
      window.removeEventListener("chatsLoad", loadChatMessages);
    };
  }, []);

  const askSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(formRef.current);
    const question = formData.get("question");

    if (!question) {
      return;
    }

    const newElement = (
      <div className="chat-message chat-message-initial-state">{question}</div>
    );
    setChatMessages([...chatMessages, newElement]);
    setQuestion("");

    setIsLoading(true);
    const response = await fetch(apiUrl("/question"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        uuid: chatSelected,
        user_session: cookies.user_session,
      }),
    });

    const message = await response.json();

    setIsLoading(false);
    if (message.error) {
      toast.error(message.error, toastDefaultSettings);
    } else {
      const content = message.content;
      const chat_uuid = message.uuid;
      setChatSelected(chat_uuid);

      let chatsListEvent = new Event("chatsList");
      chatsListEvent.newChat = [chat_uuid];
      window.dispatchEvent(chatsListEvent);

      const responseElement = (
        <div className="chat-message chat-message-initial-state">{content}</div>
      );

      setChatMessages([...chatMessages, newElement, responseElement]);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey && !isLoading) {
      event.preventDefault();
      askSubmit(event);
    }
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      const timer = setTimeout(() => {
        const lastElement = document.querySelectorAll(
          ".chat-message-initial-state"
        );
        if (lastElement.length > 0) {
          lastElement.forEach((element) => {
            element.classList.remove("chat-message-initial-state");
            element.classList.add("chat-message-final-state");
          });
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [chatMessages]);

  if (isUserLogged === 2) {
    return (
      <div className="container">
        <h1 className="title">
          Tienes que iniciar sesión para poder utilizar el chat
        </h1>
        <div className="columns">
          <div className="column">
            <Link className="button is-info is-fullwidth" to="/login">
              Iniciar sesión
            </Link>
          </div>
          <div className="column">
            <Link className="button is-success is-fullwidth" to="/register">
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    );
  } else if (isUserLogged === 0) {
    return <></>;
  }

  return (
    <>
      <div className="chat-child chat-messages">
        {chatMessages.map((element, index) => (
          <React.Fragment key={index}>{element}</React.Fragment>
        ))}
        {isLoading && (
          <progress className="progress is-small is-info" max="100" />
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-child chat-controls">
        <form ref={formRef} onSubmit={askSubmit}>
          <div className="field has-addons">
            <div className="control" style={{ flexGrow: 1 }}>
              <textarea
                className="textarea has-fixed-size"
                placeholder="Pregunta"
                name="question"
                value={question}
                onKeyDown={handleKeyDown}
                onChange={(e) => setQuestion(e.target.value)}
              ></textarea>
            </div>
            <div className="control">
              <button
                type="submit"
                className={`button is-info ${isLoading ? "is-loading" : ""}`}
                disabled={isLoading}
                style={{ height: "100%" }}
              >
                Preguntar
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Home;
