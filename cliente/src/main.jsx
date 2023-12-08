import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import Layout from "./pages/Layout/Layout.jsx";
import Login from "./pages/Login/Login.jsx";
import Logout from "./pages/Login/Logout.jsx";
import Register from "./pages/Register/Register.jsx";
import NoPage from "./pages/NoPage/NoPage.jsx";
import User from "./pages/User/User.jsx";
import "bulma/css/bulma.min.css";
import "./index.css";

const Main = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="logout" element={<Logout />} />
          <Route path="register" element={<Register />} />
          <Route path="user" element={<User />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <Main />
  // </React.StrictMode>
);
