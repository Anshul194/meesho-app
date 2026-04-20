import React, { useEffect, useState } from "react";
import { API_ENDPOINT, formatDateTime, getStatusColor } from "../util";
import {
  Backdrop,
  Box,
  CircularProgress,
  MenuItem,
  Modal,
  Pagination,
  Select,
} from "@mui/material";
import { exportToExcel } from "../util/util";

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
const WalletHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [imageName, setImageName] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(null);
  const [searchKey, setSearchKey] = useState("Amount"); // Default search key
  const [searchValue, setSearchValue] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [open3, setOpen3] = React.useState(false);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset page to 1 when rows per page changes
  };

  const fetchTransactions = async () => {
    try {
      // Retrieve the token from local storage
      const token = localStorage.getItem("token");
      const clientId = localStorage.getItem("clientId");

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/transactions/all?clientId=${clientId}&page=${page}&limit=${rowsPerPage}&dateFrom=${startDate}&dateTo=${endDate}&searchKey=${searchKey}&searchValue=${searchValue}`,
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
        setTransactions(data.transactions);
        setTotalDocs(data.totalTransactions);
      } else {
        console.error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };
  useEffect(() => {
    fetchTransactions();
  }, [page, rowsPerPage]);

  const handleSearchKeyChange = (event) => {
    setSearchKey(event.target.value);
  };

  // Define onChange function for the input element for search value
  const handleSearchValueChange = (event) => {
    setSearchValue(event.target.value);
  };

  const applyDateFilter = () => {
    fetchTransactions();
  };

  const handleExport = async () => {
    try {
      setOpen3(true);
      const token = localStorage.getItem("token");
      const clientId = localStorage.getItem("clientId");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/transactions/all?clientId=${clientId}&page=${page}&limit=${0}&dateFrom=${startDate}&dateTo=${endDate}&searchKey=${searchKey}&searchValue=${searchValue}`,
        {
          headers: {
            "x-access-token": token,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setExcelData(data.transactions);
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
          <div className="body table-responsive">
            <table className="table table-hover custom-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Transcation No</th>
                  <th>Screen Shot</th>
                  <th>Order Number</th>
                  <th>Status/Reason</th>
                  <th>Amount Debit</th>
                  <th>Amount Credit</th>
                  <th>Balance</th>
                </tr>
              </thead>

              <tbody>
                {transactions &&
                  transactions?.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{formatDateTime(transaction.createdAt)}</td>
                      <td>
                        {transaction.transactionNo
                          ? transaction.transactionNo
                          : "-"}
                      </td>

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
                          : "-"}
                      </td>

                      <td>
                        {transaction.order?.marketPlaceOrderNumber
                          ? transaction.order?.marketPlaceOrderNumber
                          : "-"}
                      </td>

                      {transaction.t_type === "payment_request" ? (
                        <td
                          style={{ color: getStatusColor(transaction.status) }}
                        >
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
              gap: "20px",
              marginTop: "10px",
            }}
          >
            <Pagination
              count={Math.ceil(totalDocs / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
            />
            <Select value={rowsPerPage} onChange={handleRowsPerPageChange}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
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
};

export default WalletHistory;
