import { Outlet, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import {
  useCheckIfUserLogged,
  apiUrl,
  toastDefaultSettings,
} from "../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faPlusCircle,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";

const Layout = () => {
  const [isUserLogged, setIsUserLogged] = useState(0);
  useCheckIfUserLogged(setIsUserLogged);

  const [visibleSidebar, setVisibleSidebar] = useState(true);
  const [selectedChat, setSelectedChat] = useState("");
  const [chatsList, setChatList] = useState([]);
  const [cookies] = useCookies(["user_session"]);

  const updateChatsList = (event) => {
    const newChat = event.newChat;

    if (event.setChat) {
      setSelectedChat(event.setChat);
    }

    setChatList((prevChatsList) => {
      if (newChat.length === 1 && !prevChatsList.includes(newChat[0].uuid)) {
        return [...prevChatsList, ...newChat];
      } else if (
        newChat.length === 1 &&
        prevChatsList.includes(newChat[0].uuid)
      ) {
        return [...prevChatsList];
      } else {
        return [...newChat];
      }
    });
  };

  useEffect(() => {
    window.addEventListener("chatsList", updateChatsList);

    return () => {
      window.removeEventListener("chatsList", updateChatsList);
    };
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      if (isUserLogged === 1) {
        let response = await fetch(apiUrl("/getChats"), {
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
            let chatsListEvent = new Event("chatsList");
            chatsListEvent.newChat = message;
            window.dispatchEvent(chatsListEvent);
          }
        } else {
          toast.error(
            "No se ha podido conectar con el servidor",
            toastDefaultSettings
          );
        }
      }
    };

    fetchChats();
  }, [isUserLogged]);

  return (
    <div className="columns">
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        theme="colored"
      />
      <div
        className={`column is-one-quarter chat-sidebar ${
          !visibleSidebar ? "chat-sidebar-hide" : ""
        }`}
      >
        <FontAwesomeIcon
          style={{ float: "right" }}
          className={`chat-sidebar-hide-button ${
            !visibleSidebar ? "chat-sidebar-hide-button-right" : ""
          }`}
          icon={faArrowLeftLong}
          onClick={() => {
            setVisibleSidebar(!visibleSidebar);
          }}
        />
        <div
          className="chat-navbar"
          style={{ visibility: visibleSidebar ? "visible" : "hidden" }}
          key={isUserLogged}
        >
          <aside className="menu chat-menu-aside">
            <p className="menu-label">General</p>
            <ul className="menu-list">
              <li>
                <Link to="/">Inicio</Link>
              </li>
              {isUserLogged === 1 ? (
                <>
                  <li>
                    <Link to="/user">Usuario</Link>
                  </li>
                  <li>
                    <Link to="/logout">Salir</Link>
                  </li>
                </>
              ) : isUserLogged === 2 ? (
                <>
                  <li>
                    <Link to="/login">Iniciar sesión</Link>
                  </li>
                  <li>
                    <Link to="/register">Registrarse</Link>
                  </li>
                </>
              ) : null}
            </ul>
            {isUserLogged === 1 ? (
              <>
                <p className="menu-label">
                  Conversaciones
                  <FontAwesomeIcon
                    className="chat-menu-buttons"
                    style={{
                      marginLeft: "auto",
                      paddingRight: "10px",
                      visibility: selectedChat ? "visible" : "hidden",
                    }}
                    icon={faTrashCan}
                    onClick={async () => {
                      if (isUserLogged === 1) {
                        let response = await fetch(
                          apiUrl(`/getChat/${selectedChat}`),
                          {
                            method: "DELETE",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              user_session: cookies.user_session,
                            }),
                          }
                        );

                        if (response.ok) {
                          const message = await response.json();

                          if (message.error) {
                            toast.error(message.error, toastDefaultSettings);
                          } else {
                            const event = new Event("chatsLoad");
                            event.uuid = "";
                            window.dispatchEvent(event);
                            setSelectedChat("");

                            setChatList((prevChatsList) => {
                              return prevChatsList.filter(
                                (chat) => chat !== selectedChat
                              );
                            });
                          }
                        } else {
                          toast.error(
                            "No se ha podido conectar con el servidor",
                            toastDefaultSettings
                          );
                        }
                      }
                    }}
                  />
                  <FontAwesomeIcon
                    className="chat-menu-buttons chat-menu-button-add"
                    icon={faPlusCircle}
                    onClick={() => {
                      const event = new Event("chatsLoad");
                      event.uuid = "";
                      window.dispatchEvent(event);
                      setSelectedChat("");
                    }}
                  />
                </p>
                <ul className="menu-list chat-conversations">
                  {chatsList.map((element) => (
                    <li
                      className={
                        element.uuid === selectedChat
                          ? "chat-conversation-selected"
                          : ""
                      }
                      key={element.uuid}
                    >
                      <a
                        onClick={() => {
                          const event = new Event("chatsLoad");
                          event.uuid = element.uuid;
                          window.dispatchEvent(event);
                          setSelectedChat(element.uuid);
                        }}
                      >
                        {element.summary}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </aside>
        </div>
      </div>
      <div className="column">
        <div className={`chat-flex ${!visibleSidebar ? "chat-flex-hide" : ""}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
