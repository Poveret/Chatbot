import { useCookies } from "react-cookie";
import { useCheckIfUserLogged } from "../../utils";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiUrl, toastDefaultSettings } from "../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import {
  faCalculator,
  faRuler,
  faWeightScale,
} from "@fortawesome/free-solid-svg-icons";

const User = () => {
  const [cookies] = useCookies(["user_session"]);

  const [isUserLogged, setIsUserLogged] = useState(0);
  useCheckIfUserLogged(setIsUserLogged);

  // Nuevos estados para peso y altura
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  // Funciones para gestionar cambios en peso y altura
  const handleWeightChange = (event) => {
    setWeight(event.target.value);
  };

  const handleHeightChange = (event) => {
    setHeight(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isUserLogged === 1) {
        try {
          const response = await fetch(apiUrl("/user"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_session: cookies.user_session,
            }),
          });
          const data = await response.json();

          setWeight(data.weight);
          setHeight(data.height);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }
    };

    fetchData();
  }, [isUserLogged]);

  if (isUserLogged === 0) {
    return <></>;
  } else if (isUserLogged === 2) {
    return <Navigate to="/" replace={true} />;
  }

  const submitUser = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    let weight = formData.get("weight");
    let height = formData.get("height");
    let imc = formData.get("imc");

    let response = await fetch(apiUrl("/user"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        weight,
        height,
        imc,
        user_session: cookies.user_session,
      }),
    });

    if (response.ok) {
      let message = await response.json();
      if (message.error) {
        toast.error(message.error, toastDefaultSettings);
      } else {
        toast.success("Datos guardados", toastDefaultSettings);
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
      <h1 className="title">Usuario</h1>

      <form onSubmit={submitUser}>
        <div className="field">
          <label className="label">
            Peso (kg):
            <p className="control has-icons-left">
              <input
                type="text"
                className="input"
                value={weight}
                name="weight"
                onChange={handleWeightChange}
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faWeightScale} />
              </span>
            </p>
          </label>
          <br />
          <label className="label">
            Altura (cm):
            <p className="control has-icons-left">
              <input
                type="text"
                className="input"
                value={height}
                name="height"
                onChange={handleHeightChange}
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faRuler} />
              </span>
            </p>
          </label>
        </div>
        <button className="button is-primary is-fullwidth" type="submit">
          Guardar
        </button>
        {weight && height && (
          <div style={{ marginTop: "25px" }}>
            <label className="label">Índice de Masa Corporal (IMC):</label>
            <p className="control has-icons-left">
              <input
                className="input"
                type="text"
                name="imc"
                value={calculateBMI(weight, height)}
                readOnly
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faCalculator} />
              </span>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

const calculateBMI = (weight, height) => {
  const bmi = (weight / ((height / 100) * (height / 100))).toFixed(2);
  return bmi;
};

export default User;
