import "./App.css";

import Add from "./components/Money";
import { Outlet } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";

import Cl from "./components/Clients";

import Dmani from "./components/DownloadManifest";
import Dorder from "./components/History";
import Ind from "./components/Dashboard";
import Lpf from "./components/LatestProduct";
import Pagelogin from "./components/page-login";
import Pending from "./components/pending";
import Pu from "./components/ProductList";
import Pl from "./components/Product";
import Prequest from "./components/Payment";
import Wallet from "./components/wallet";

import { Link } from "react-router-dom";
// import { Outlet } from 'react-router-dom';
import Nav from "./components/nav";

import "../src/assets/css/main.css";
import "../src/assets/css/main2.css";
import "bootstrap/dist/css/bootstrap.css";
import "../src/assets/vendor/bootstrap/css/bootstrap.css";
import AddMoney from "./components/AddMoney";
import OrderHistory from "./components/OrderHistory";
import CreateOrder from "./components/CreateOrder";
import UploadManifest from "./components/UploadManifest";
import WalletHistory from "./components/WalletHistory";
import React, { useEffect, useState } from "react";
import ShippingMethods from "./components/ShippingMethods";
import { Box, Drawer, List, ListItem } from "@mui/material";
import DownloadLabels from "./components/DownloadLabels";
import UploadLabels from "./components/UploadLabels";

<link rel="icon" type="image/x-icon" href="/public/favicon.ico" />


function App() {
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

  // find url segment
  const url = window.location.href;
  const urlSegment = url.split("/")[3];


  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <Box
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <ListItem disablePadding>
          <nav id="left-sidebar-nav" className="sidebar-nav">
            <ul id="main-menu" className="metismenu li_animation_delay">
              {user && user === "admin" ? (
                <li>
                  <Link
                    to="/dashboard"
                    className={urlSegment === "dashboard" ? "active" : ""}
                  >
                    <i className="fa fa-dashboard pr-3"></i>
                    <span>Dashboard</span>
                  </Link>
                </li>
              ) : (
                <li>
                  <Link
                    to="/dashboard"
                    className={urlSegment === "dashboard" ? "active" : ""}
                  >
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
                    <li className={urlSegment === "pending" ? "active" : ""}>
                      <Link to="/pending">Pending Orders</Link>{" "}
                    </li>
                    <li className={urlSegment === "History" ? "active" : ""}>
                      <Link to="/History">Downloaded Orders / History</Link>
                    </li>
                    <li
                      className={
                        urlSegment === "DownloadManifest" ? "active" : ""
                      }
                    >
                      <Link to="/DownloadManifest">Download Manifest</Link>
                    </li>
                    <li
                      className={
                        urlSegment === "DownloadLabels" ? "active" : ""
                      }
                    >
                      <Link to="/DownloadLabels">Download Labels</Link>
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
                    <li
                      className={urlSegment === "CreateOrder" ? "active" : ""}
                    >
                      <Link to="/CreateOrder">Create Order</Link>{" "}
                    </li>
                    <li
                      className={
                        urlSegment === "UploadManifest" ? "active" : ""
                      }
                    >
                      <Link to="/UploadManifest">Upload Manifest</Link>
                    </li>
                    <li
                      className={
                        urlSegment === "UploadLabels" ? "active" : ""
                      }
                    >
                      <Link to="/UploadLabels">Upload Labels</Link>
                    </li>
                    <li
                      className={urlSegment === "OrderHistory" ? "active" : ""}
                    >
                      <Link to="/OrderHistory">Order History</Link>
                    </li>
                  </ul>
                </li>
              )}

              {user && user === "admin" ? (
                <li>
                  <a href="#Widgets" className="has-arrow">
                    <i className="fa fa-puzzle-piece pr-3"></i>
                    <span>Wallet</span>
                  </a>
                  <ul>
                    <li className={urlSegment === "Payment" ? "active" : ""}>
                      <Link to="/Payment">Payment Request</Link>
                    </li>
                    <li className={urlSegment === "Money" ? "active" : ""}>
                      <Link to="/Money">Add / Less Money</Link>
                    </li>
                    <li className={urlSegment === "Wallet" ? "active" : ""}>
                      <Link to="/Wallet/all">Wallet History</Link>
                    </li>
                  </ul>
                </li>
              ) : (
                <li>
                  <a href="#Widgets" className="has-arrow">
                    <i className="fa fa-puzzle-piece pr-3"></i>
                    <span>Wallet</span>
                  </a>
                  <ul>
                    <li className={urlSegment === "AddMoney" ? "active" : ""}>
                      <Link to="/AddMoney">Add Money</Link>
                    </li>

                    <li
                      className={urlSegment === "WalletHistory" ? "active" : ""}
                    >
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
                    <li className={urlSegment === "Product" ? "active" : ""}>
                      <Link to="/Product">Products List</Link>
                    </li>
                    <li
                      className={urlSegment === "LatestProduct" ? "active" : ""}
                    >
                      <Link to="/LatestProduct">Latest Product File</Link>
                    </li>
                    <li
                      className={urlSegment === "ProductList" ? "active" : ""}
                    >
                      <Link to="/ProductList">Products URL</Link>
                    </li>
                  </ul>
                </li>
              )}
              {user && user === "admin" && (
                <>
                  <li>
                    <Link to="/ShippingMethods">
                      <i className="fa fa-truck pr-3"></i>
                      <span>Shipping Methods</span>
                    </Link>
                  </li>
                  <li>
                    <a href="#charts" className="has-arrow">
                      <i className="fa fa-area-chart pr-3"></i>
                      <span>Portal Clients</span>
                    </a>
                    <ul>
                      <li className={urlSegment === "Clients" ? "active" : ""}>
                        <Link to="/Clients">Clients List</Link>{" "}
                      </li>
                    </ul>
                  </li>
                </>
              )}
              <li
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                  window.location.href = "/Login";
                }}
              >
                <div
                  style={{
                    cursor: "pointer",
                    position: "relative",
                    padding: "13px 20px",
                    fontSize: "15px",
                  }}
                >
                  <i className="fa fa-power-off pr-3"></i>
                  <span>Logout</span>
                </div>
              </li>
            </ul>
          </nav>
        </ListItem>
      </List>
    </Box>
  );
  return (
    <>
      <React.Fragment>
        <Drawer
          variant="temporary"
          anchor={"left"}
          open={state["left"]}
          onClose={toggleDrawer("left", false)}
        >
          {list("left")}
        </Drawer>
      </React.Fragment>

      <div>
        <Nav onclick={toggleDrawer("left", true)} />
        <Outlet />
      </div>
    </>
  );
}

export default App;

export const approuter = createBrowserRouter([
  { path: "/Login", element: <Pagelogin /> },
  { path: "/", element: <Pagelogin /> },
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Ind /> },
      { path: "/dashboard", element: <Ind /> },
      { path: "/pending", element: <Pending /> },
      { path: "/History", element: <Dorder /> },
      { path: "/DownloadManifest", element: <Dmani /> },
      { path: "/DownloadLabels", element: <DownloadLabels /> },
      { path: "/UploadLabels", element: <UploadLabels /> },
      { path: "/Payment", element: <Prequest /> },
      { path: "/Money", element: <Add /> },
      { path: "/Wallet/:id", element: <Wallet /> },
      { path: "/Product", element: <Pl /> },
      { path: "/LatestProduct", element: <Lpf /> },
      { path: "/ProductList", element: <Pu /> },
      { path: "/Clients", element: <Cl /> },
      { path: "/AddMoney", element: <AddMoney /> }, //ipf
      { path: "/OrderHistory", element: <OrderHistory /> }, // oh
      { path: "/CreateOrder", element: <CreateOrder /> }, // co
      { path: "/UploadManifest", element: <UploadManifest /> }, // um
      { path: "/WalletHistory", element: <WalletHistory /> }, // wallet
      { path: "/ShippingMethods", element: <ShippingMethods /> },
    ],
  },
]);
