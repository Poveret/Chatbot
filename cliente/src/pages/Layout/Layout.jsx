import { Outlet, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useState } from "react";
import { useCheckIfUserLogged } from "../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";

const Layout = () => {
  const [isUserLogged, setIsUserLogged] = useState(0);
  useCheckIfUserLogged(setIsUserLogged);

  const [visibleSidebar, setVisibleSidebar] = useState(true);

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
          <aside className="menu">
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
                <p className="menu-label">Conversaciones</p>
                <ul className="menu-list chat-conversations">
                  <li>
                    <a>Chat 1</a>
                  </li>
                  <li>
                    <a>Chat 2</a>
                  </li>
                  <li>
                    <a>Chat 3</a>
                  </li>
                  <li>
                    <a>Chat 4</a>
                  </li>
                  <li>
                    <a>Chat 5</a>
                  </li>
                  <li>
                    <a>Chat 6</a>
                  </li>
                  <li>
                    <a>Chat 7</a>
                  </li>
                  <li>
                    <a>Chat 8</a>
                  </li>
                  <li>
                    <a>Chat 9</a>
                  </li>
                  <li>
                    <a>Chat 10</a>
                  </li>
                  <li>
                    <a>Chat 11</a>
                  </li>
                  <li>
                    <a>Chat 12</a>
                  </li>
                  <li>
                    <a>Chat 13</a>
                  </li>
                  <li>
                    <a>Chat 14</a>
                  </li>
                  <li>
                    <a>Chat 15</a>
                  </li>
                  <li>
                    <a>Chat 16</a>
                  </li>
                  <li>
                    <a>Chat 17</a>
                  </li>
                  <li>
                    <a>Chat 18</a>
                  </li>
                  <li>
                    <a>Chat 19</a>
                  </li>
                  <li>
                    <a>Chat 20</a>
                  </li>
                  <li>
                    <a>Chat 21</a>
                  </li>
                  <li>
                    <a>Chat 22</a>
                  </li>
                  <li>
                    <a>Chat 23</a>
                  </li>
                  <li>
                    <a>Chat 24</a>
                  </li>
                  <li>
                    <a>Chat 25</a>
                  </li>
                  <li>
                    <a>Chat 26</a>
                  </li>
                  <li>
                    <a>Chat 27</a>
                  </li>
                  <li>
                    <a>Chat 28</a>
                  </li>
                  <li>
                    <a>Chat 29</a>
                  </li>
                  <li>
                    <a>Chat 30</a>
                  </li>
                </ul>
              </>
            ) : null}
          </aside>
        </div>
      </div>
      <div className="column">
        <div className="chat-flex">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
