import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";
import { API_ENDPOINT, formatDateTime, getStatusColor } from "../util";
import {
  Box,
  MenuItem,
  Modal,
  Pagination,
  Select as MUISelect,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import Select from "react-select";
import { exportToExcel } from "../util/util";
import { useParams } from "react-router-dom";

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

export default function Wallet() {
  const [transactions, setTransactions] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [imageName, setImageName] = React.useState("");
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(null);
  const [searchKey, setSearchKey] = useState("Amount"); // Default search key
  const [searchValue, setSearchValue] = useState("");
  const [open3, setOpen3] = React.useState(false);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1);
  };

  useEffect(() => {
    fetchTransactions(selectedClient);
    fetchClients();
  }, [page, rowsPerPage, selectedClient]);

  let url = useParams();
  useEffect(() => {
    if (url.id) {
      setSelectedClient(url.id);
    }
  }, [url.id]);

  const fetchTransactions = async (clientId) => {
    let url = `${API_ENDPOINT}/api/v1/transactions/all`;
    if (clientId === "all") {
      url = `${API_ENDPOINT}/api/v1/transactions/all?page=${page}&limit=${rowsPerPage}&dateFrom=${startDate}&dateTo=${endDate}&searchKey=${searchKey}&searchValue=${searchValue}`;
    } else {
      url = `${API_ENDPOINT}/api/v1/transactions/all?clientId=${clientId}&page=${page}&limit=${rowsPerPage}&dateFrom=${startDate}&dateTo=${endDate}&searchKey=${searchKey}&searchValue=${searchValue}`;
    }

    try {
      // Retrieve the token from local storage
      const token = localStorage.getItem("token");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setTotalDocs(data.totalTransactions);
      } else {
        console.error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

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
        setClients(data.data); // Update the state with client data
      } else {
        console.error("Failed to fetch clients");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  // Define onChange function for the select element

  // Define onChange function for the select element for search key
  const handleSearchKeyChange = (event) => {
    setSearchKey(event.target.value);
  };

  // Define onChange function for the input element for search value
  const handleSearchValueChange = (event) => {
    setSearchValue(event.target.value);
  };

  const applyDateFilter = () => {
    // Update the URL according to the selected search key and value
    let url;

    if (selectedClient === "all") {
      url = `${API_ENDPOINT}/api/v1/transactions/all?page=${page}&limit=${rowsPerPage}&dateFrom=${startDate}&dateTo=${endDate}&searchKey=${searchKey}&searchValue=${searchValue}`;
    } else {
      url = `${API_ENDPOINT}/api/v1/transactions/all?clientId=${selectedClient}&page=${page}&limit=${rowsPerPage}&dateFrom=${startDate}&dateTo=${endDate}&searchKey=${searchKey}&searchValue=${searchValue}`;
    }

    // const url = `${API_ENDPOINT}/api/v1/transactions/all?clientId=${selectedClient}&page=${page}&limit=${rowsPerPage}&dateFrom=${startDate}&dateTo=${endDate}&searchKey=${searchKey}&searchValue=${searchValue}`;

    try {
      // Retrieve the token from local storage
      const token = localStorage.getItem("token");

      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setTransactions(data.transactions);
          setTotalDocs(data.totalTransactions);
        })
        .catch((error) => {
          console.error("Error fetching transactions:", error);
        });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleExport = async () => {
    try {
      setOpen3(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/transactions/all?clientId=${
          selectedClient || ""
        }&page=${page}&limit=${0}&dateFrom=${startDate}&dateTo=${endDate}&searchKey=${searchKey}&searchValue=${searchValue}`,
        {
          headers: {
            "x-access-token": token,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        const exportableData = data.transactions.map((txn) => ({
          ...txn,
          marketPlaceOrderNumber:
            txn.marketPlaceOrderNumber ||
            txn.order?.marketPlaceOrderNumber ||
            "N/A",
        }));
        setExcelData(exportableData);

        // setExcelData(data.transactions);
      } else {
        console.error("Failed to fetch orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOpen3(false);
    }
  };

  useEffect(() => {
    if (excelData.length > 0) {
      cleanExcelData(excelData);
    }
  }, [excelData]);
  const cleanExcelData = () => {
    console.log("Cleaned");
    console.log(excelData);

    let cleanedData = [];

    for (let i = 0; i < excelData.length; i++) {
      const txn = excelData[i];

      const cleanedTxns = {
        "Date & Time": formatDateTime(txn.createdAt),
        Client: txn.client?.clientName || txn.order?.client?.clientName,
        "Transaction No.": txn?.transactionNo,
        "Market Place Order Number": txn.marketPlaceOrderNumber,
        "Status/Reason": txn.remarks || txn.order?.status || txn.status,
        "Amount Debit": txn.amountDebit,
        "Amount Credit": txn.amountCredit,
        Balance:
          txn.balance > 0
            ? `Cr ${txn.balance}`
            : txn.balance < 0
            ? `Dr ${txn.balance}`
            : txn.balance,
      };
      cleanedData.push(cleanedTxns);
    }

    console.log("Cleaned Data:");
    console.log(cleanedData);
    exportToExcel(cleanedData, `Transaction-${formatDateTime(new Date())}`);
  };

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
                    setPage(1);

                    setSelectedClient(selectedOption.value);

                    // fetchTransactions(selectedOption.value);
                  }}
                  value={selectedClient}
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
              <div className="col-sm-6">
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

              <div className="col-sm-6">
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
            </div>

            <div className="row">
              <div className="col-sm-3" style={{ marginTop: "8px" }}>
                <select
                  className="form-control "
                  value={searchKey}
                  onChange={handleSearchKeyChange}
                >
                  <option value="Amount">Amount</option>
                  <option value="transactionNo">Transaction No</option>
                  <option value="marketPlaceOrderNumber">
                    Marketplace Order No
                  </option>
                </select>
              </div>
              <div className="col-sm-3" style={{ marginTop: "8px" }}>
                <input
                  className="form-control "
                  type="text"
                  name="text"
                  value={searchValue}
                  onChange={handleSearchValueChange}
                  placeholder="Search Value"
                />
              </div>
              <div
                style={{ display: "flex", gap: "10px", marginTop: "8px" }}
                className="col-sm-9"
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
                    setSearchKey("Amount");
                    setSearchValue("");
                    setPage(1);
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
                <button
                  className=" "
                  onClick={handleExport}
                  style={{
                    backgroundColor: "green",
                    borderRadius: "20px",
                    color: "#FFF",
                    outline: "none",
                    border: "none",
                    padding: "4px 16px",
                  }}
                >
                  <i className="fa-solid fa-download pr-2"></i>
                  Export to Excel
                </button>
              </div>
            </div>
          </div>
          <div className="body table-responsive ">
            <table className="table table-hover custom-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Client</th>
                  <th>Transaction No</th>
                  <th>Screen Shot</th>
                  <th>Marketplace Order Number</th>
                  <th>Status/Reason</th>
                  <th>Amount Debit</th>
                  <th>Amount Credit</th>
                  <th>Balance</th>
                </tr>
              </thead>

              <tbody>
                {transactions?.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{formatDateTime(transaction.createdAt)}</td>
                    <td>
                      {transaction.client?.clientName ||
                        transaction.order?.client?.clientName}
                    </td>
                    <td>{transaction.transactionNo || `-`}</td>
                    <td
                      style={{
                        color: transaction.screenshot ? "blue" : "black",
                        cursor: transaction.screenshot ? "pointer" : "default",
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
                        : "-"}
                    </td>
                    <td>{transaction.order?.marketPlaceOrderNumber || "-"}</td>

                    {transaction.t_type === "payment_request" ? (
                      <td style={{ color: getStatusColor(transaction.status) }}>
                        {transaction.status}
                      </td>
                    ) : transaction.t_type === "order_creation" ||
                      transaction.t_type === "order_update" ? (
                      <td
                        style={{
                          color: getStatusColor(transaction.order?.status),
                        }}
                      >
                        {transaction.order?.status}
                      </td>
                    ) : (
                      <td
                        style={{ color: getStatusColor("Approved") }}
                        className="status-reason"
                      >
                        {transaction.remarks}
                      </td>
                    )}

                    <td>{transaction.amountDebit}</td>
                    <td>{transaction.amountCredit}</td>
                    <td>
                      {transaction.balance < 0
                        ? `Dr ${Math.abs(transaction.balance)} `
                        : `Cr ${transaction.balance} `}
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
              gap: "10px",
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
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={open3}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </div>
  );
}
