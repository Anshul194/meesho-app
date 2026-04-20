import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";
import { API_ENDPOINT, formatDateTime } from "../util";
import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
} from "@mui/material";
import { Link } from "react-router-dom";

export default function Cl() {
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googlePassword, setGooglePassword] = useState("");
  const [meeshoEmail, setMeeshoEmail] = useState("");
  const [meeshoPassword, setMeeshoPassword] = useState("");
  const [endDate, setEndDate] = useState("");
  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [editClient, setEditClient] = useState(null);

  const [snack, setSnack] = React.useState("");
  const [snackType, setSnackType] = React.useState("success");

  const handleClick1 = () => {
    setOpen1(true);
  };

  const handleClose1 = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen1(false);
  };

  const handleClickOpen = (client) => {
    setEditClient(client);

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset page to 1 when rows per page changes
  };

  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    fetchClients();
  }, []);
  console.log(clients);
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/clients/selected/all`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setClients(data.data);
        filteredClients(data.data);
      } else {
        console.error("Failed to fetch clients:", data.message);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const clientData = {
        clientData: {
          clientName,
          walletBalance: "",
          email,
          password,
          phone: phoneNumber,
          gstNo: gstNo,
          googleAuth: {
            email: googleEmail,
            password: googlePassword,
          },
          meeshoAuth: {
            email: meeshoEmail,
            password: meeshoPassword,
          },
          endDate: endDate,
        },
      };

      const response = await fetch(`${API_ENDPOINT}/api/v1/clients/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify(clientData),
      });

      const data = await response.json();
      if (data.success) {
        console.log("Client added successfully:", data.message);
        setClientName("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
        setGstNo("");
        setGoogleEmail("");
        setGooglePassword("");
        setMeeshoEmail("");
        setMeeshoPassword("");
        setEndDate("");

        setSnack(data.message);
        setSnackType("success");
        handleClick1();

        fetchClients();
      } else {
        console.error("Failed to add client:", data.message);
        setSnack(data.message);
        setSnackType("error");
        handleClick1();
      }
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const updatedClientData = {
        clientData: {
          ...editClient,
        },
      };

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/clients/update/${editClient._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify(updatedClientData),
        }
      );

      const data = await response.json();
      if (data.success) {
        console.log("Client updated successfully:", data.message);
        handleClose(); // Close the dialog after successful update
        setEditClient(null);
        fetchClients();
        setSnack(data.message);
        setSnackType("success");
        handleClick1();
      } else {
        console.error("Failed to update client:", data.message);
        setSnack(data.message);
        setSnackType("error");
        handleClick1();
      }
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const indexOfLastItem = page * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div id="main-content">
      <div className="container-fluid">
        <div className="card">
          <div className="header">
            <h4 className="head01 mt-5 mb-3">Serach Client List</h4>
            <div className="row">
              <div className="col-sm-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Name or Mail or Phone Number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <h6 className="head03" style={{ textAlign: "left" }}>
              Clients Details
            </h6>
            <div className=" table-responsive">
              <table className="table table-hover custom-table">
                <thead>
                  <tr>
                    <th>Cleint Name</th>
                    <th>Wallet Balance</th>
                    <th>Email ID</th>
                    <th>Phone No</th>
                    <th>Password</th>
                    <th>GST No</th>
                    <th>Google Email ID</th>
                    <th>Google Password</th>
                    <th>Meesho Email ID</th>
                    <th>Meesho Password</th>
                    <th>Start Date & Time</th>
                    <th>End Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems &&
                    currentItems.map((client) => (
                      <tr key={client._id}>
                        <td>{client.clientName}</td>
                        <td>
                          <Link to={`/Wallet/${client._id}`}>
                            {client.walletBalance}
                          </Link>
                        </td>
                        <td>{client.email}</td>
                        <td>{client.phone}</td>
                        <td>{client.password}</td>
                        <td>{client.gstNo}</td>
                        <td>{client.googleAuth.email}</td>
                        <td>{client.googleAuth.password}</td>
                        <td>{client.meeshoAuth.email}</td>
                        <td>{client.meeshoAuth.password}</td>
                        <td>{formatDateTime(client.createdAt)}</td>
                        <td>{client.endDate}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-info"
                            title="Edit"
                            onClick={() => handleClickOpen(client)}
                          >
                            <i className="fa fa-edit"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
                marginTop: "10px",
              }}
            >
              <Pagination
                count={Math.ceil(filteredClients.length / rowsPerPage)}
                page={page}
                onChange={handlePageChange}
              />
              <Select value={rowsPerPage} onChange={handleRowsPerPageChange}>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </div>

            <h4 className="head01 mt-3">Create New</h4>
            <form className="mt-5" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-sm-4">
                  <h4 className="head01 mb-4">Our Panel Login</h4>
                  <div className="form-group">
                    <label htmlFor="clientName">Client Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Client Name"
                    />

                    <label htmlFor="email" className="mt-4">
                      Email Id
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Email"
                    />

                    <label htmlFor="phoneNumber" className="mt-4">
                      Phone Number
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter Phone No"
                    />

                    <label htmlFor="password" className="mt-4">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />

                    <label htmlFor="gstNo" className="mt-4">
                      GST No.
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="gstNo"
                      value={gstNo}
                      onChange={(e) => setGstNo(e.target.value)}
                      placeholder="Enter Gst No"
                    />
                    <label htmlFor="gstNo" className="mt-4">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="gstNo"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="Enter Gst No"
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <h4 className="head01 mb-4">Google Login</h4>
                  <div className="form-group">
                    <label htmlFor="googleEmail">Email Id</label>
                    <input
                      type="email"
                      className="form-control"
                      id="googleEmail"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="Enter Email"
                    />

                    <label htmlFor="googlePassword" className="mt-4">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="googlePassword"
                      value={googlePassword}
                      onChange={(e) => setGooglePassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <h4 className="head01 mb-4">Meesho Login</h4>
                  <div className="form-group">
                    <label htmlFor="meeshoEmail">Email Id</label>
                    <input
                      type="email"
                      className="form-control"
                      id="meeshoEmail"
                      value={meeshoEmail}
                      onChange={(e) => setMeeshoEmail(e.target.value)}
                      placeholder="Enter Email"
                    />

                    <label htmlFor="meeshoPassword" className="mt-4">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="meeshoPassword"
                      value={meeshoPassword}
                      onChange={(e) => setMeeshoPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="sub-button02 mt-3">
                Submit
              </button>
            </form>

            {editClient && (
              <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {"Update Client"}
                </DialogTitle>
                <DialogContent>
                  <form className="mt-5" onSubmit={handleEditSubmit}>
                    <div className="row">
                      <h4 className="head01 mb-4">Our Panel Login</h4>
                      <div className="form-group">
                        <label htmlFor="clientName">Client Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="clientName"
                          value={editClient.clientName}
                          onChange={(e) =>
                            setEditClient({
                              ...editClient,
                              clientName: e.target.value,
                            })
                          }
                          placeholder="Client Name"
                        />

                        <label htmlFor="email" className="mt-4">
                          Email Id
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={editClient.email}
                          onChange={(e) =>
                            setEditClient({
                              ...editClient,
                              email: e.target.value,
                            })
                          }
                          placeholder="Enter Email"
                        />

                        <label htmlFor="phoneNumber" className="mt-4">
                          Phone Number
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="phone"
                          value={editClient.phone}
                          onChange={(e) =>
                            setEditClient({
                              ...editClient,
                              phone: e.target.value,
                            })
                          }
                          placeholder="Enter Phone No"
                        />

                        <label htmlFor="password" className="mt-4">
                          Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          value={editClient.password}
                          onChange={(e) =>
                            setEditClient({
                              ...editClient,
                              password: e.target.value,
                            })
                          }
                          placeholder="Enter password"
                        />

                        <label htmlFor="gstNo" className="mt-4">
                          GST No.
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="gstNo"
                          value={editClient.gstNo}
                          onChange={(e) =>
                            setEditClient({
                              ...editClient,
                              gstNo: e.target.value,
                            })
                          }
                          placeholder="Enter Gst No"
                        />

                        <label htmlFor="endDate" className="mt-4">
                          End Date
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="endDate"
                          value={editClient.endDate}
                          onChange={(e) =>
                            setEditClient({
                              ...editClient,
                              endDate: e.target.value,
                            })
                          }
                          placeholder="Enter Gst No"
                        />
                      </div>

                      <div>
                        <h4 className="head01 mb-4">Google Login</h4>
                        <div className="form-group">
                          <label htmlFor="googleEmail">Email Id</label>
                          <input
                            type="email"
                            className="form-control"
                            id="googleEmail"
                            value={editClient.googleAuth.email}
                            onChange={(e) =>
                              setEditClient({
                                ...editClient,
                                googleAuth: {
                                  ...editClient.googleAuth,
                                  email: e.target.value,
                                },
                              })
                            }
                            placeholder="Enter Email"
                          />

                          <label htmlFor="googlePassword" className="mt-4">
                            Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="googlePassword"
                            value={editClient.googleAuth.password}
                            onChange={(e) =>
                              setEditClient({
                                ...editClient,
                                googleAuth: {
                                  ...editClient.googleAuth,
                                  password: e.target.value,
                                },
                              })
                            }
                            placeholder="Enter password"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="head01 mb-4">Meesho Login</h4>
                        <div className="form-group">
                          <label htmlFor="meeshoEmail">Email Id</label>
                          <input
                            type="email"
                            className="form-control"
                            id="meeshoEmail"
                            value={editClient.meeshoAuth.email}
                            onChange={(e) =>
                              setEditClient({
                                ...editClient,
                                meeshoAuth: {
                                  ...editClient.meeshoAuth,
                                  email: e.target.value,
                                },
                              })
                            }
                            placeholder="Enter Email"
                          />

                          <label htmlFor="meeshoPassword" className="mt-4">
                            Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="meeshoPassword"
                            value={editClient.meeshoAuth.password}
                            onChange={(e) =>
                              setEditClient({
                                ...editClient,
                                meeshoAuth: {
                                  ...editClient.meeshoAuth,
                                  password: e.target.value,
                                },
                              })
                            }
                            placeholder="Enter password"
                          />
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="sub-button02 mt-3">
                      Update
                    </button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Snackbar
            open={open1}
            autoHideDuration={10000}
            onClose={handleClose1}
          >
            <Alert
              onClose={handleClose1}
              severity={snackType}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snack}
            </Alert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
}
