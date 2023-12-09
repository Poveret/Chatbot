import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { useCheckIfUserLogged, toastDefaultSettings } from "../../utils";

const Logout = () => {
  const [cookies, removeCookie] = useCookies(["user_session"]);

  const [isUserLogged, setIsUserLogged] = useState(0);
  useCheckIfUserLogged(setIsUserLogged);

  useEffect(() => {
    removeCookie("user_session", "", { sameSite: true });
  }, [removeCookie]);

  if (isUserLogged === 0) {
    return <></>;
  } else if (isUserLogged === 2) {
    return <Navigate to="/" replace={true} />;
  }

  toast.success("Sesión cerrada", toastDefaultSettings);
  return <Navigate to="/" replace={true} state={{ loggedOut: true }} />;
};

export default Logout;
