import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";
import { API_ENDPOINT, formatDateTime } from "../util";
import {
  Box,
  MenuItem,
  Modal,
  Pagination,
  Select as MUISelect,
  Snackbar,
  Alert,
} from "@mui/material";
import Select from "react-select";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  maxWidth: "90vw", // Adjust maximum width of the box
  maxHeight: "90vh", // Adjust maximum height of the box
  bgcolor: "background.paper",
  border: "2px solid #fff !important",
  boxShadow: 24,
  padding: "16px",
  overflow: "auto",
};
export default function Prequest() {
  const [transactions, setTransactions] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [imageName, setImageName] = React.useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(null);
  const [open2, setOpen2] = React.useState(false);
  const [snack, setSnack] = React.useState("");
  const [snackType, setSnackType] = React.useState("success");
  const handleClick2 = () => {
    setOpen2(true);
  };

  const handleClose2 = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen2(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset page to 1 when rows per page changes
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/transactions/all?t_type=payment_request&clientId=${selectedClient}&page=${page}&limit=${rowsPerPage}&dateFrom=${startDate}&dateTo=${endDate}`,
        {
          headers: {
            "x-access-token": token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data.transactions);
      setTotalDocs(data.totalTransactions);
      setSnack(data.message);
      setSnackType("success");
      handleClick2();
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchTransactions();
  }, [page, rowsPerPage, selectedClient]);

  const fetchClients = async () => {
    try {
      // Retrieve the token from local storage
      const token = localStorage.getItem("token");

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

      if (response.ok) {
        const data = await response.json();
        setClients(data.data);
      } else {
        console.error("Failed to fetch clients");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const applyDateFilter = () => {
    fetchTransactions();
  };

  const handleStatusChange = async (transactionId, newStatus) => {
    console.log(transactionId, newStatus);
    if (newStatus !== "Pending") {
      updateStatus(transactionId, newStatus);
    }
  };

  async function updateStatus(transactionId, newStatus) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/transactions/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({ status: newStatus, transactionId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update transaction status");
      }
      fetchTransactions();
      console.log(`Transaction status updated successfully: ${transactionId}`);
    } catch (error) {
      console.error("Error updating transaction status:", error);
    }
  }

  return (
    <div id="main-content">
      <div className="container-fluid">
        <div className="card">
          <div className="header">
            <div className="row">
              <div className="col-sm-6">
                <Select
                  options={clients.map((client) => ({
                    value: client._id,
                    label: client.clientName,
                  }))}
                  onChange={(selectedOption) => {
                    setSelectedClient(selectedOption.value);
                  }}
                  // value={selectedClient}
                  placeholder="Select a client..."
                />
              </div>
            </div>

            <div className="row" style={{ padding: "8px 15px 0px 15px" }}>
              {selectedClient && clients.length > 0 && (
                <div
                  className="col-sm-12"
                  style={{
                    backgroundColor: "#f2f3f4",
                    color: "#000",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ fontWeight: "bolder" }}>
                    {
                      clients.find((client) => client._id === selectedClient)
                        ?.clientName
                    }
                  </div>
                  <div style={{ fontWeight: "bold" }}>
                    {
                      clients.find((client) => client._id === selectedClient)
                        ?.phone
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-sm-4">
                <label>Start Date</label>
                <input
                  className="form-control "
                  type="date"
                  name="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                />
              </div>

              <div className="col-sm-4">
                <label>End Date</label>
                <input
                  className="form-control"
                  type="date"
                  name="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "30px",
                  alignItems: "center",
                }}
                className="col-sm-2"
              >
                <button
                  className=" "
                  onClick={() => {
                    setPage(1);
                    applyDateFilter();
                  }}
                  style={{
                    backgroundColor: "#1341E8",
                    borderRadius: "20px",
                    color: "#FFF",
                    outline: "none",
                    border: "none",
                    padding: "4px 16px",
                  }}
                >
                  Apply
                </button>

                <button
                  className=" "
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  style={{
                    backgroundColor: "red",
                    borderRadius: "20px",
                    color: "#FFF",
                    outline: "none",
                    border: "none",
                    padding: "4px 16px",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          <div className="body table-responsive">
            <table className="table table-hover custom-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Phone No</th>
                  <th>Date & Time</th>
                  <th>Transaction No</th>
                  <th>Screen Shot</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions &&
                  transactions?.map((transaction, index) => (
                    <tr key={index}>
                      <td>{transaction.client.clientName}</td>
                      <td>{transaction.client.phone}</td>
                      <td>{formatDateTime(transaction.createdAt)}</td>
                      <td>{transaction.transactionNo}</td>

                      <td
                        style={{
                          color: transaction.screenshot ? "blue" : "black",
                          cursor: transaction.screenshot
                            ? "pointer"
                            : "default",
                        }}
                        onClick={() => {
                          if (transaction.screenshot) {
                            handleOpen();
                            setImageName(transaction.screenshot);
                          }
                        }}
                      >
                        {transaction.screenshot
                          ? `${API_ENDPOINT}/uploads/${transaction.screenshot}`
                              .substring(0, 12)
                              .concat("...")
                          : "PNA"}
                      </td>

                      <td>{transaction.amount}</td>
                      <td>
                        <select
                          value={transaction.status}
                          onChange={(e) =>
                            handleStatusChange(transaction._id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
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
              count={Math.ceil(totalDocs / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
            />
            <MUISelect value={rowsPerPage} onChange={handleRowsPerPageChange}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </MUISelect>
          </div>
        </div>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <img
            style={{ width: "100%" }}
            src={`${API_ENDPOINT}/uploads/${imageName}`}
            alt="product "
          />
        </Box>
      </Modal>
      <Snackbar open={open2} autoHideDuration={10000} onClose={handleClose2}>
        <Alert
          onClose={handleClose2}
          severity={snackType}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack}
        </Alert>
      </Snackbar>
    </div>
  );
}
