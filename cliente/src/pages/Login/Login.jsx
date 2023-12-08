import { useCookies } from "react-cookie";
import { apiUrl, toastDefaultSettings } from "../../utils";
import { toast } from "react-toastify";
import { useCheckIfUserLogged } from "../../utils";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUser } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [cookies, setCookie] = useCookies(["user_session"]);

  const [isUserLogged, setIsUserLogged] = useState(0);
  useCheckIfUserLogged(setIsUserLogged);

  if (isUserLogged === 0) {
    return <></>;
  } else if (isUserLogged === 1) {
    return <Navigate to="/" replace={true} />;
  }

  const submitRegister = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    let username = formData.get("username");
    let password = formData.get("password");

    let response = await fetch(apiUrl("/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (response.ok) {
      let message = await response.json();
      if (message.error) {
        toast.error(message.error, toastDefaultSettings);
      } else {
        toast.success("Sesión iniciada", toastDefaultSettings);
        setCookie("user_session", message.session_token, {
          path: "/",
          sameSite: true,
        });
      }
    } else {
      toast.error(
        "No se ha podido conectar con el servidor",
        toastDefaultSettings
      );
    }
  };

  return (
    <div className="container">
      <h1 className="title">Iniciar sesión</h1>
      <form onSubmit={submitRegister}>
        <div className="field">
          <p className="control has-icons-left">
            <input
              className="input"
              type="text"
              name="username"
              placeholder="Usuario"
            />
            <span className="icon is-small is-left">
              <FontAwesomeIcon icon={faUser} />
            </span>
          </p>
        </div>
        <div className="field">
          <p className="control has-icons-left">
            <input
              className="input"
              name="password"
              type="password"
              placeholder="Contraseña"
            />
            <span className="icon is-small is-left">
              <FontAwesomeIcon icon={faLock} />
            </span>
          </p>
        </div>
        <button className="button is-primary is-fullwidth" type="submit">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
