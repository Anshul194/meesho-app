import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import userImg from "../images/user-small.png";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";

export default function Side() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      try {
        setUser(user);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  console.log(user);

  return (
    <div id="left-sidebar" className="sidebar">
      <button type="button" className="btn-toggle-offcanvas">
        <i className="fa fa-arrow-left"></i>
      </button>
      <div className="sidebar-scroll">
        <div className="user-account">
          <img
            src={userImg}
            className="rounded-circle user-photo"
            alt="User Profile "
          />
          <div className="dropdown">
            <span>Welcome,</span>
            {/* <a href="javascript:void(0);" className=" user-name"> */}
            <strong>Admin</strong>
            {/* </a> */}
          </div>
          <hr />
        </div>

        <div className="tab-content padding-0">
          <div className="tab-pane active" id="menu">
            <nav id="left-sidebar-nav" className="sidebar-nav">
              <ul id="main-menu" className="metismenu li_animation_delay">
                {user && user === "admin" ? (
                  <li>
                    <Link to="/dashboard">
                      <i className="fa fa-dashboard pr-3"></i>
                      <span>Dashboard</span>
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link to="/dashboard">
                      <i className="fa fa-dashboard pr-3"></i>
                      <span>Dashboard</span>
                    </Link>
                  </li>
                )}
                {user && user === "admin" ? (
                  <li>
                    <a href="#App" className="has-arrow">
                      <i className="fa fa-cart-plus pr-3"></i>
                      <span>Orders</span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/pending">Pending Orders</Link>{" "}
                      </li>
                      <li>
                        <Link to="/History">Downloaded Orders / History</Link>
                      </li>
                      <li>
                        <Link to="/Download Manifest">Download Manifest</Link>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <li>
                    <a href="#App" className="has-arrow">
                      <i className="fa fa-cart-plus pr-3"></i>
                      <span>Orders</span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/CreateOrder">Create Order</Link>{" "}
                      </li>
                      <li>
                        <Link to="/UploadManifest">Upload Manifest</Link>
                      </li>
                      <li>
                        <Link to="/OrderHistory">Order History</Link>
                      </li>
                    </ul>
                  </li>
                )}

                {user && user === "admin" ? (
                  <li className="active">
                    <a href="#Widgets" className="has-arrow">
                      <i className="fa fa-puzzle-piece pr-3"></i>
                      <span>Wallet</span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/Payment">Payment Request</Link>
                      </li>
                      <li className="active">
                        <Link to="/Money">Add / Less Money</Link>
                      </li>
                      <li>
                        <Link to="/Wallet">Wallet History</Link>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <li className="active">
                    <a href="#Widgets" className="has-arrow">
                      <i className="fa fa-puzzle-piece pr-3"></i>
                      <span>Wallet</span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/AddMoney">Add Money</Link>
                      </li>

                      <li>
                        <Link to="/WalletHistory">Wallet History</Link>
                      </li>
                    </ul>
                  </li>
                )}

                {user && user === "admin" && (
                  <li>
                    <a href="#uiElements" className="has-arrow">
                      <i className="fa fa-diamond pr-3"></i>
                      <span>Products </span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/Product">Products List</Link>
                      </li>
                      <li>
                        <Link to="/LatestProduct">Latest Product File</Link>
                      </li>
                      <li>
                        <Link to="/ProductList">Products URL</Link>
                      </li>
                    </ul>
                  </li>
                )}
                {console?.log(user)}
                {user && user == "admin" && (
                  <li>
                    <Link to="/ShippingMethods">
                      <i className="fa fa-truck pr-3"></i>
                      <span>Shipping Methods</span>
                    </Link>
                  </li>
                )}
                {user && user === "admin" && (
                  <li>
                    <Link to="/ShippingMethods">
                      <i className="fa fa-truck pr-3"></i>
                      <span>Shipping Methods</span>
                    </Link>
                  </li>
                )}
                {user && user === "admin" && (
                  <li>
                    <a href="#charts" className="has-arrow">
                      <i className="fa fa-area-chart pr-3"></i>
                      <span>Portal Clients</span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/Clients">Clients List</Link>{" "}
                      </li>
                    </ul>
                  </li>
                )}
                <li
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  <Link to="/Login">
                    <i className="fa fa-power-off pr-3"></i>
                    <span>Logout</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="tab-pane" id="Chat">
            <form>
              <div className="input-group m-b-20">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <i className="icon-magnifier pr-3"></i>
                  </span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                />
              </div>
            </form>
          </div>
          <div className="tab-pane" id="setting"></div>
          <div className="tab-pane" id="question">
            <form>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <i className="icon-magnifier pr-3"></i>
                  </span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
