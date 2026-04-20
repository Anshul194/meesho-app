import React from "react";
import { Link } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";
export default function Nav({ onclick }) {
  const isAdmin = localStorage.getItem("user") === "admin";
  const name = localStorage.getItem("c_name");
  return (
    <nav className="navbar navbar-fixed-top" style={{ position: "sticky" }}>
      <div className="container-fluid">
        <div className="navbar-brand">
          <button
            type="button"
            className=""
            onClick={onclick}
            style={{ paddingRight: "32px" }}
          >
            <i className="fa fa-bars"></i>
          </button>

          <Link to="/dashboard">{isAdmin ? "Style4Sure" : name}</Link>
        </div>

        <div className="navbar-right">
          <div id="navbar-menu">
            <ul className="nav navbar-nav"></ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
