import { useCookies } from "react-cookie";
import { useCheckIfUserLogged } from "../../utils";
import { Navigate } from "react-router-dom";
import { useState } from "react";

const User = () => {
  const [cookies, setCookie] = useCookies(["user_session"]);

  const [isUserLogged, setIsUserLogged] = useState(0);
  useCheckIfUserLogged(setIsUserLogged);

  if (isUserLogged === 0) {
    return <></>;
  } else if (isUserLogged === 2) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <>
      <h1>Usuario</h1>
    </>
  );
};

export default User;
