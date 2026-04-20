import React, { useEffect, useState } from "react";
import { API_ENDPOINT, formatDateTime, getStatusColor } from "../util";
import {
  Alert,
  Backdrop,
  CircularProgress,
  MenuItem,
  Pagination,
  Select as MUISelect,
  Snackbar,
} from "@mui/material";
import { exportToExcel } from "../util/util";

import Select from "react-select";

const OrderHistory = () => {
  const [marketPlace, setMarketPlace] = useState("");
  const marketPlaceOptions = [
    { value: "Meesho", label: "Meesho" },
    { value: "Amazon", label: "Amazon" },
    { value: "Flipkart", label: "Flipkart" },
    { value: "Snapdeal", label: "Snapdeal" },
    { value: "Glowroad", label: "Glowroad" },
    { value: "Shopify", label: "Shopify" },
    { value: "Others", label: "Others" },
  ];
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [totalDocs, setTotalDocs] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [snack, setSnack] = React.useState("");
  const [snackType, setSnackType] = React.useState("success");
  const [excelData, setExcelData] = useState([]);
  const [open3, setOpen3] = React.useState(false);
  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset page to 1 when rows per page changes
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const clientId = localStorage.getItem("clientId");

      if (!token || !clientId) {
        throw new Error("Token or clientId not found in localStorage");
      }

      const queryParams = [
        `clientId=${clientId || ""}`,
        `orderNumber=${searchValue}`,
        `page=${page}`,
        `limit=${rowsPerPage}`,
        `from=${startDate}`,
        `to=${endDate}`,
      ];

      if (marketPlace)
        queryParams.push(`marketPlace=${encodeURIComponent(marketPlace)}`);

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/orders/selected/all?${queryParams.join("&")}`,
        {
          headers: {
            "x-access-token": token,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setTotalDocs(data.totalOrders);
        setSnack(data.message);
        setSnackType("success");
        handleClick();
      } else {
        console.error("Failed to fetch orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, marketPlace]);

  const handleFileChange = (event, orderId) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("label", file);
    formData.append("orderId", orderId);

    uploadLabel(formData);
  };

  const uploadLabel = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/orders/upload-label`,
        {
          method: "POST",
          headers: {
            "x-access-token": token,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        console.log("Label uploaded successfully");
        setSnack(data.message);
        setSnackType("success");
        handleClick();
        fetchOrders();
      } else {
        console.error("Failed to upload label:", data.message);
        setSnack(data.message);
        setSnackType("error");
        handleClick();
      }
    } catch (error) {
      console.error("Error uploading label:", error);
    }
  };

  const handleCheckboxChange = (order) => {
    const updatedOrders = orders.map((o) => {
      if (o._id === order._id) {
        return { ...o, selected: !o.selected };
      }
      return o;
    });
    setOrders(updatedOrders);
  };

  const toggleSelectAll = () => {
    const updatedOrders = orders.map((order) => {
      if (orders.includes(order)) {
        return {
          ...order,
          selected: !selectAll,
        };
      }
      return order;
    });

    setOrders(updatedOrders);
    setSelectAll(!selectAll);
  };
  const handleSearchValueChange = (event) => {
    setSearchValue(event.target.value);
  };
  const applyDateFilter = () => {
    fetchOrders();
  };

  const handleMarketPlaceChange = (selected) => {
    if (selected) {
      setMarketPlace(selected.value);
    } else {
      setMarketPlace("");
    }
    setPage(1); // Reset to first page on filter change
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
        `${API_ENDPOINT}/api/v1/orders/selected/all?clientId=${clientId}&orderNumber=${searchValue}&page=${page}&limit=${0}&from=${startDate}&to=${endDate}`,
        {
          headers: {
            "x-access-token": token,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setExcelData(data.data);
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
    // console.log("Cleaned");
    // console.log(excelData);
    let cleanedData = [];

    for (let i = 0; i < excelData.length; i++) {
      const order = excelData[i];
      if (order.revisions === 1) {
        for (let j = 0; j < order.orders.length; j++) {
          const item = order.orders[j];
          const cleanedOrder = {
            "Market Place Order Number": item.marketPlaceOrderNumber,
            Client: item.client.clientName,
            "Date & Time": formatDateTime(item.createdAt),
            "Product Name": item.product.productName,
            "Product SKU": item.product.productSKU,
            "Master SKU": item.masterSKU,
            "Product Price": item.productPrice,
            Quantity: item.quantity,
            "Shipping Method": item.shippingMethod || "",
            "Shipping Charge": item.shippingCharge !== undefined ? item.shippingCharge : "",
            "Total Price": item.totalPrice,
          };
          cleanedData.push(cleanedOrder);
        }
      } else {
        const cleanedOrder = {
          "Market Place Order Number": order.marketPlaceOrderNumber,
          Client: order.client.clientName,
          "Date & Time": formatDateTime(order.createdAt),
          "Product Name": order.product.productName,
          "Product SKU": order.product.productSKU,
          "Master SKU": order.masterSKU,
          "Product Price": order.productPrice,
          Quantity: order.quantity,
          "Shipping Method": order.shippingMethod || "",
          "Shipping Charge": order.shippingCharge !== undefined ? order.shippingCharge : "",
          "Total Price": order.totalPrice,
        };
        cleanedData.push(cleanedOrder);
      }
    }

    console.log("Cleaned Data:");
    console.log(cleanedData);
    exportToExcel(cleanedData, `Orders-${formatDateTime(new Date())}`);
  };

  return (
    <div id="main-content">
      <div className="container-fluid">
        <div className="card">
          <div className="header">
            <div className="row">
              <div className="col-sm-3" style={{ marginTop: "8px", marginBottom: "8px" }}>
                <Select
                  options={marketPlaceOptions}
                  isClearable
                  value={
                    marketPlace
                      ? { value: marketPlace, label: marketPlace }
                      : null
                  }
                  onChange={handleMarketPlaceChange}
                  placeholder="Select Marketplace"
                />
              </div>
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
                <input
                  className="form-control "
                  type="text"
                  name="text"
                  value={searchValue}
                  onChange={handleSearchValueChange}
                  placeholder="Search Order Number..."
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
          <div className="body">
            <div className="table-responsive">
              <table className="table table-hover mb-0 c_list custom-table">
                <thead>
                  <tr>
                    <th>
                      <label className="fancy-checkbox">
                        <input
                          className="select-all"
                          type="checkbox"
                          name="checkbox"
                          checked={selectAll}
                          onChange={toggleSelectAll}
                        />
                        <span></span>
                      </label>
                    </th>
                    <th>Actions</th>
                    <th>Marketplace Order Number</th>
                    <th>Date & Time</th>
                    <th>Master SKU</th>
                    <th>Product SKU</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Packing Charge</th>
                    <th>Shipping Method</th>
                    <th>Shipping Charge</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {orders &&
                    orders.map((order) => (
                      <React.Fragment key={order._id}>
                        {order.revisions &&
                          order.revisions === 1 &&
                          order.orders.map((item, index) => (
                            <tr key={item._id}>
                              <td style={{ width: "50px" }}>
                                <label className="fancy-checkbox">
                                  <input
                                    className="checkbox-tick"
                                    type="checkbox"
                                    name="checkbox"
                                    checked={order.selected}
                                    onChange={() => handleCheckboxChange(order)}
                                  />
                                  <span></span>
                                </label>
                              </td>

                              {index === 0 && (
                                <td rowSpan={order.orders.length}>
                                  <label
                                    htmlFor={`file-upload-${item._id}`}
                                    style={{
                                      textDecoration: "none",
                                      color: "#fff",
                                      backgroundColor: "blue",
                                      borderRadius: "20px",
                                      padding: "4px 10px",
                                      cursor: "pointer",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    <i className="fa-solid fa-upload pr-2"></i>
                                    Label
                                  </label>
                                  <input
                                    id={`file-upload-${item._id}`}
                                    type="file"
                                    accept="application/pdf"
                                    style={{ display: "none" }}
                                    onChange={(e) =>
                                      handleFileChange(e, order._id)
                                    }
                                  />
                                  <br />
                                  {order.labelName && order.labelPath && (
                                    <span
                                      style={{
                                        color: "green",
                                        fontSize: "10px",
                                        padding: "4px 8px",
                                        backgroundColor: "#aaffaa",
                                        borderRadius: "40px",
                                      }}
                                    >
                                      Uploaded
                                    </span>
                                  )}
                                </td>
                              )}

                              <td>
                                <span className="phone">
                                  <i className="zmdi zmdi-phone m-r-10"></i>
                                  {item.marketPlaceOrderNumber}
                                </span>
                              </td>

                              <td>{formatDateTime(order.createdAt)}</td>
                              <td>
                                <p className="c_name">{item.masterSKU}</p>
                              </td>
                              <td>
                                <address>
                                  <i className="zmdi zmdi-pin"></i>
                                  {item.product.productSKU}
                                </address>
                              </td>
                              <td>
                                <span className="phone">
                                  <i className="zmdi zmdi-phone m-r-10"></i>
                                  {item.quantity}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{ color: getStatusColor(item.status) }}
                                >
                                  {item.status}
                                </span>{" "}
                                <br />
                                {formatDateTime(item.createdAt)}
                              </td>
                              <td>{item.productPrice}</td>
                              <td>{item.packingCharge}</td>
                              <td>{item.shippingMethod || ""}</td>
                              <td>{item.shippingCharge !== undefined ? item.shippingCharge : ""}</td>
                              <td>{item.totalPrice}</td>
                            </tr>
                          ))}

                        {(!order.revisions || order.revisions !== 1) && (
                          <tr>
                            <td style={{ width: "50px" }}>
                              <label className="fancy-checkbox">
                                <input
                                  className="checkbox-tick"
                                  type="checkbox"
                                  name="checkbox"
                                  checked={order.selected}
                                  onChange={() => handleCheckboxChange(order)}
                                />
                                <span></span>
                              </label>
                            </td>
                            <td>
                              <label
                                htmlFor={`file-upload-${order._id}`}
                                style={{
                                  textDecoration: "none",
                                  color: "#fff",
                                  backgroundColor: "blue",
                                  borderRadius: "20px",
                                  padding: "4px 10px",
                                  cursor: "pointer",
                                  marginBottom: "4px",
                                }}
                              >
                                <i className="fa-solid fa-upload pr-2"></i>Label
                              </label>
                              <input
                                id={`file-upload-${order._id}`}
                                type="file"
                                accept="application/pdf"
                                style={{ display: "none" }}
                                onChange={(e) => handleFileChange(e, order._id)}
                              />
                              <br />
                              {order.labelName && order.labelPath && (
                                <span
                                  style={{
                                    color: "green",
                                    fontSize: "10px",
                                    padding: "4px 8px",
                                    backgroundColor: "#aaffaa",
                                    borderRadius: "40px",
                                  }}
                                >
                                  Uploaded
                                </span>
                              )}
                            </td>

                            <td>
                              <span className="phone">
                                <i className="zmdi zmdi-phone m-r-10"></i>
                                {order.marketPlaceOrderNumber}
                              </span>
                            </td>
                            <td>{formatDateTime(order.createdAt)}</td>
                            <td>
                              <p className="c_name">{order.masterSKU}</p>
                            </td>
                            <td>
                              <address>
                                <i className="zmdi zmdi-pin"></i>
                                {order.product.productSKU}
                              </address>
                            </td>
                            <td>
                              <span className="phone">
                                <i className="zmdi zmdi-phone m-r-10"></i>
                                {order.quantity}
                              </span>
                            </td>
                            <td>
                              <span
                                style={{ color: getStatusColor(order.status) }}
                              >
                                {order.status}
                              </span>{" "}
                              <br /> {formatDateTime(order.createdAt)}
                            </td>
                            <td>{order.productPrice}</td>
                            <td>{order.packingCharge}</td>
                            <td>{order.totalPrice}</td>
                          </tr>
                        )}
                      </React.Fragment>
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
          <Snackbar open={open} autoHideDuration={10000} onClose={handleClose}>
            <Alert
              onClose={handleClose}
              severity={snackType}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snack}
            </Alert>
          </Snackbar>
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={open3}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
