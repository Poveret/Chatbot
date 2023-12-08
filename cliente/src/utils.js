import { useEffect } from "react";
import { useCookies } from "react-cookie";

export const apiUrl = (path) => {
  let url = "";
  if (process.env.NODE_ENV === "development") {
    url = "http://localhost:3000";
  }

  return url + "/api" + path;
};

export const useCheckIfUserLogged = (setIsUserLogged, callback) => {
  const [cookies] = useCookies(["user_session"]);

  useEffect(() => {
    const fetchIsLogged = async () => {
      let response = await fetch(apiUrl("/islogged"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.user_session}`,
        },
      });

      // 0 loading, 1 logged, 2 not logged
      const isLogged = (await response.json()).isLogged ? 1 : 2;

      setIsUserLogged(isLogged);
      if (callback) {
        callback(isLogged);
      }
    };

    fetchIsLogged();
  }, [cookies, setIsUserLogged, callback]);
};

export const toastDefaultSettings = {
  position: "top-center",
  autoClose: 1500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: false,
  pauseOnFocusLoss: false,
  progress: undefined,
  theme: "colored",
};
