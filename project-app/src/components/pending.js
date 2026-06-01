import React, { useState, useEffect } from "react";

import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";
import { API_ENDPOINT, formatDateTime } from "../util";
import {
  Box,
  Button,
  MenuItem,
  Modal,
  Pagination,
  Select as MUISelect,
  LinearProgress,
  Typography,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import Select from "react-select";
import axios from "axios";
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

export default function Pending() {
  const [orders, setOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchValue, setSearchValue] = useState("");
  const [marketPlace, setMarketPlace] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");
  const [shippingMethods, setShippingMethods] = useState([]);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");

  const showWarning = (msg) => {
    setWarningMsg(msg);
    setWarningOpen(true);
  };
  const marketPlaceOptions = [
    { value: "Meesho", label: "Meesho" },
    { value: "Amazon", label: "Amazon" },
    { value: "Flipkart", label: "Flipkart" },
    { value: "Snapdeal", label: "Snapdeal" },
    { value: "Glowroad", label: "Glowroad" },
    { value: "Shopify", label: "Shopify" },
    { value: "Others", label: "Others" },
  ];
  const [totalDocs, setTotalDocs] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [imageName, setImageName] = useState(null);
  const [percentCompleted, setPercentCompleted] = useState(0);
  const [requestedDateTime, setRequestedDateTime] = React.useState(null);
  const [modalTitle, setModalTitle] = useState("Generating Labels...");
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snack, setSnack] = React.useState("");
  const [snackType, setSnackType] = React.useState("success");
  const [loaderOpen, setLoaderOpen] = React.useState(false);

  const handleSnackOpen = () => {
    setSnackOpen(true);
  };

  const handleSnackClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setImageName(null);
  };

  const handleClickOpen2 = () => {
    setOpen2(true);
  };

  // Edit shipping/market info modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editData, setEditData] = useState({ marketId: "", trackingUrl: "", shippingPartnerName: "" });

  const openEditModal = (order, item) => {
    setEditingOrderId(order._id);
    setEditingItemId(item ? item._id : null);
    setEditData({
      marketId: item?.marketId || order.marketId || "",
      trackingUrl: item?.trackingUrl || order.trackingUrl || "",
      shippingPartnerName: item?.shippingPartnerName || order.shippingPartnerName || "",
    });
    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setEditingOrderId(null);
    setEditingItemId(null);
  };

  const saveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");
      const payload = {
        orderId: editingOrderId,
        revisions: editingItemId ? 1 : 0,
        itemId: editingItemId,
        marketId: editData.marketId,
        trackingUrl: editData.trackingUrl,
        shippingPartnerName: editData.shippingPartnerName,
      };

      const res = await fetch(`${API_ENDPOINT}/api/v1/orders/update-shipping-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-access-token": token },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        closeEditModal();
        fetchOrders();
      } else {
        alert(data.message || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating shipping info");
    }
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1);
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token not found in localStorage");
      }
      // plus 1 day in this data endDate

      const queryParams = [
        `clientId=${selectedClient || ""}`,
        `orderNumber=${searchValue}`,
        `page=${page}`,
        `limit=${rowsPerPage}`,
        `from=${startDate}`,
        `to=${endDate}`,
        `isLableDownloaded=false`,
        `status=pending`
      ];
      if (marketPlace) queryParams.push(`marketPlace=${encodeURIComponent(marketPlace)}`);
      if (shippingMethod) queryParams.push(`shippingMethod=${encodeURIComponent(shippingMethod)}`);
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
      } else {
        console.error("Failed to fetch orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
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

  useEffect(() => {
    fetchOrders();
    fetchClients();
  }, [selectedClient, page, rowsPerPage, marketPlace, shippingMethod]);

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_ENDPOINT}/api/v1/shipping-methods`, {
        headers: { "x-access-token": token },
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setShippingMethods(data.data.map((m) => ({ value: m.name, label: m.name })));
      }
    } catch (err) {
      console.error("Failed to fetch shipping methods:", err);
    }
  };

  const applyDateFilter = () => {
    fetchOrders();
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
  const handleMarketPlaceChange = (selected) => {
    if (selected) {
      setMarketPlace(selected.value);
    } else {
      setMarketPlace("");
    }
    setPage(1); // Reset to first page on filter change
  };

  const buildCleanedData = (sourceData, exportSelectedOnly = false) => {
    const cleanedData = [];

    for (let i = 0; i < sourceData.length; i++) {
      const order = sourceData[i];

      if (order.revisions === 1 && Array.isArray(order.orders)) {
        const items = exportSelectedOnly
          ? (order.selected ? order.orders : order.orders.filter((item) => item.selected))
          : order.orders;

        for (let j = 0; j < items.length; j++) {
          const item = items[j];
          cleanedData.push({
            "Market Place Order Number": item.marketPlaceOrderNumber || "",
            Client: item.client?.clientName || "",
            "Date & Time": formatDateTime(item.createdAt),
            "Product Name": item.product?.productName || "",
            "Product SKU": item.product?.productSKU || "",
            "Master SKU": item.masterSKU || "",
            "Product Price": item.productPrice || 0,
            Quantity: item.quantity || 0,
            "Total Price": item.totalPrice || 0,
          });
        }
      } else {
        if (exportSelectedOnly && !order.selected) {
          continue;
        }

        cleanedData.push({
          "Market Place Order Number": order.marketPlaceOrderNumber || "",
          Client: order.client?.clientName || "",
          "Date & Time": formatDateTime(order.createdAt),
          "Product Name": order.product?.productName || "",
          "Product SKU": order.product?.productSKU || "",
          "Master SKU": order.masterSKU || "",
          "Product Price": order.productPrice || 0,
          Quantity: order.quantity || 0,
          "Total Price": order.totalPrice || 0,
        });
      }
    }

    return cleanedData;
  };

  const handleExport = async () => {
    try {
      setLoaderOpen(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const hasSelectedOrders = orders.some((order) => {
        if (order.revisions === 1 && Array.isArray(order.orders)) {
          return order.selected || order.orders.some((item) => item.selected);
        }
        return order.selected;
      });

      if (hasSelectedOrders) {
        const cleanedSelectedData = buildCleanedData(orders, true);
        exportToExcel(
          cleanedSelectedData,
          `Pending-Orders-${formatDateTime(new Date())}`
        );
        return;
      }

      const queryParams = [
        `clientId=${selectedClient || ""}`,
        `orderNumber=${searchValue}`,
        `from=${startDate}`,
        `to=${endDate}`,
        `isLableDownloaded=false`,
        `status=pending`,
        `exportAll=true`,
      ];
      if (marketPlace) queryParams.push(`marketPlace=${encodeURIComponent(marketPlace)}`);
      if (shippingMethod) queryParams.push(`shippingMethod=${encodeURIComponent(shippingMethod)}`);
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
        const cleanedData = buildCleanedData(data.data);
        exportToExcel(cleanedData, `Pending-Orders-${formatDateTime(new Date())}`);
      } else {
        console.error("Failed to fetch orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoaderOpen(false);
    }
  };

  const handleDownloadLabels = async () => {
    try {
      // 1. Mandatory Filter Validation
      if (!marketPlace) {
        showWarning("❌ Please select a Marketplace filter first before downloading labels.");
        return;
      }

      if (marketPlace.toLowerCase() !== "meesho" && !shippingMethod) {
        showWarning(`❌ Please select a Shipping Method filter for ${marketPlace} before downloading labels.`);
        return;
      }

      const selectedOrders = orders.filter((order) => order.selected);
      const selectedOrderIds = selectedOrders.map((order) => order._id);

      if (selectedOrderIds.length === 0) {
        showWarning("Please select at least one item to download.");
        return;
      }

      // ─── Validation: shipping method for non-Meesho ─────────────────────
      const missingShipping = [];

      for (const order of selectedOrders) {
        const marketplace = order.marketPlace || "";

        // Non-Meesho orders require a shipping method
        if (marketplace.toLowerCase() !== "meesho") {
          let hasShipping = false;
          if (order.revisions === 1 && Array.isArray(order.orders) && order.orders.length > 0) {
            hasShipping = order.orders.every((item) => !!item.shippingMethod);
          } else {
            hasShipping = !!order.shippingMethod;
          }

          if (!hasShipping) {
            const num =
              order.marketPlaceOrderNumber ||
              order.orders?.[0]?.marketPlaceOrderNumber ||
              order._id;
            missingShipping.push(`${num} (${marketplace || "N/A"})`);
          }
        }
      }

      if (missingShipping.length > 0) {
        showWarning(
          `❌ The following orders require a Shipping Method before downloading:\n\n${missingShipping.join(", ")}\n\nNote: Only Meesho orders can be downloaded without a shipping method.`
        );
        return;
      }
      // ─────────────────────────────────────────────────────────────────────

      const token = localStorage.getItem("token");
      setRequestedDateTime(new Date());
      setPercentCompleted(0);
      setModalTitle("Generating Labels...");
      handleClickOpen2(); // Open modal so progress bar is visible

      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/orders/downloadLabels`,
        { ids: selectedOrderIds, selectAll: false, isLableDownloaded: false },
        {
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            const percentCompleted1 = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setPercentCompleted(percentCompleted1);
          },
        }
      );

      if (response.data && response.data instanceof Blob) {
        if (response.data.type === "application/json") {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              showWarning(errorData.message || "Failed to download labels");
            } catch (e) {
              showWarning("An error occurred during label generation.");
            }
          };
          reader.readAsText(response.data);
          handleClose2();
          setPercentCompleted(0);
          return;
        }

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "labels.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        handleClose2();
        fetchOrders();
        setPercentCompleted(0);
        setSelectAll(false);
      } else {
        handleClose2();
        setPercentCompleted(0);
        setSelectAll(false);
        showWarning("No data received from server.");
      }
    } catch (error) {
      console.error("Error downloading labels:", error);
      handleClose2();
      setPercentCompleted(0);

      if (error.response && error.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            showWarning(`❌ ${errorData.message || "Failed to download labels"}`);
          } catch (e) {
            showWarning("❌ Error: Valid labels not found or server error.");
          }
        };
        reader.readAsText(error.response.data);
      } else {
        showWarning("❌ Failed to download labels. Please try again.");
      }
    }
  };

  const handleSentToDownloadedOrders = async () => {
    try {
      const selectedOrderIds = orders
        .filter((order) => order.selected)
        .map((order) => order._id);

      if (selectedOrderIds.length === 0) {
        alert("Please select at least one item");
        return;
      }

      const token = localStorage.getItem("token");
      setRequestedDateTime(new Date());
      setModalTitle("Moving Orders to History...");
      setPercentCompleted(30);
      handleClickOpen2();

      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/orders/sendToDownloadedLables`,
        { ids: selectedOrderIds, selectAll: false },
        {
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
        }
      );
      setPercentCompleted(100);
      setSnack("Orders moved to history successfully!");
      setSnackType("success");
      handleSnackOpen();
    } catch (error) {
      setSnack("Failed to move orders. Please try again.");
      setSnackType("error");
      handleSnackOpen();
    } finally {
      handleClose2();
      fetchOrders();
      setSelectAll(false);
    }
  };

  const handleRowDownload = (e, path, order) => {
    if (!marketPlace) {
      e.preventDefault();
      showWarning("❌ Please select a Marketplace filter first.");
      return;
    }
    if (marketPlace.toLowerCase() !== "meesho" && !shippingMethod) {
      e.preventDefault();
      showWarning(`❌ Please select a Shipping Method filter for ${marketPlace}.`);
      return;
    }
    // If okay, the default behavior of the <a> tag will handle the download
  };

  return (
    <div id="main-content">
      <div className="container-fluid">
        <div className="card">
          <div className="header">
            <div className="row">
              <div className="col-sm-3" style={{ marginTop: "8px" }}>
                <Select
                  options={marketPlaceOptions}
                  isClearable
                  value={marketPlace ? { value: marketPlace, label: marketPlace } : null}
                  onChange={handleMarketPlaceChange}
                  placeholder="Select Marketplace"
                />
              </div>
              <div className="col-sm-3" style={{ marginTop: "8px" }}>
                <Select
                  options={shippingMethods}
                  isClearable
                  value={shippingMethod ? { value: shippingMethod, label: shippingMethod } : null}
                  onChange={(selected) => {
                    setShippingMethod(selected ? selected.value : "");
                    setPage(1);
                  }}
                  placeholder="Select Shipping Method"
                />
              </div>
            </div>
            <div
              className="row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="col-sm-6">
                <Select
                  options={clients.map((client) => ({
                    value: client._id,
                    label: client.clientName,
                  }))}
                  onChange={(selectedOption) => {
                    setPage(1);
                    setSelectedClient(selectedOption.value);
                    fetchOrders(selectedOption.value);
                    setEndDate("");
                    setStartDate("");
                    setSearchValue("");
                  }}
                  // isClearable
                  placeholder="Select a client..."
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
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "8px",
                  flexWrap: "wrap",
                }}
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
                    setSelectedClient("");

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
                <button
                  className=" "
                  onClick={handleSentToDownloadedOrders}
                  style={{
                    backgroundColor: "black",
                    borderRadius: "20px",
                    color: "#FFF",
                    outline: "none",
                    border: "none",
                    padding: "4px 16px",
                  }}
                >
                  <i className="fa-solid fa-paper-plane pr-2"></i>
                  Move to Downloaded History
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
                    <th>Client</th>
                    <th>Date & Time</th>
                    <th>Product Details</th>
                    <th>Product SKU</th>
                    <th>Marketplace</th>
                    <th>Status</th>
                    <th>Shipping Method</th>
                    <th>Quantity</th>
                    <th>Packing Charge</th>
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
                              {index === 0 && (
                                <td
                                  rowSpan={order.orders.length}
                                  className="col-action"
                                >
                                  <label className="fancy-checkbox">
                                    <input
                                      className="checkbox-tick"
                                      type="checkbox"
                                      name="checkbox"
                                      checked={order.selected}
                                      onChange={() =>
                                        handleCheckboxChange(order)
                                      }
                                    />
                                    <span></span>
                                  </label>
                                </td>
                              )}

                              {index === 0 && (
                                <td rowSpan={order.orders.length}>
                                  {order.labelPath ? (
                                    <a
                                      style={{
                                        textDecoration: "none",
                                        color: "#fff",
                                        backgroundColor: "blue",
                                        borderRadius: "20px",
                                        padding: "4px 10px",
                                      }}
                                      href={`${API_ENDPOINT}/${order.labelPath}`}
                                      download={true}
                                      onClick={(e) => handleRowDownload(e, order.labelPath, order)}
                                    >
                                      <i className="fa-solid fa-download pr-2"></i>{" "}
                                      Label
                                    </a>
                                  ) : (
                                    <a
                                      style={{
                                        textDecoration: "none",
                                        color: "#fff",
                                        backgroundColor: "blue",
                                        borderRadius: "20px",
                                        padding: "4px 10px",
                                      }}
                                    >
                                      <i className="fa-solid fa-download pr-2"></i>{" "}
                                      Label
                                    </a>
                                  )}
                                </td>
                              )}

                              <td>{item.marketPlaceOrderNumber}</td>
                              <td>{item.client.clientName}</td>
                              <td>{formatDateTime(item.createdAt)}</td>

                              <td>
                                <img
                                  src={`${API_ENDPOINT}/${item?.product?.filePath}`}
                                  alt="product-img"
                                  width={50}
                                  height={50}
                                  onClick={() => {
                                    console.log("clicked");
                                    handleClickOpen();
                                    setImageName(
                                      `${API_ENDPOINT}/${item?.product?.filePath}`
                                    );
                                  }}
                                />
                                <p className="c_name">
                                  {item.product?.productName}
                                  <span className="badge badge-default m-l-10 hidden-sm-down" />
                                </p>
                              </td>

                              <td>
                                <address>
                                  <i className="zmdi zmdi-pin"></i>
                                  {item.product?.productSKU}
                                </address>
                              </td>
                              <td>{order.marketPlace || "-"}</td>
                              <td>{item.status || "-"}</td>
                              <td>{item.shippingMethod || "-"}</td>
                              <td>
                                <span className="phone">
                                  <i className="zmdi zmdi-phone m-r-10"></i>
                                  {item.quantity}
                                </span>
                              </td>
                              <td>{item.packingCharge ?? "-"}</td>
                              <td>{item.shippingCharge ?? "-"}</td>
                              <td>{item.totalPrice ?? "-"}</td>
                            </tr>
                          ))}

                        {(!order.revisions || order.revisions !== 1) && (
                          <tr>
                            <td className="col-action">
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
                              {order.labelPath ? (
                                <a
                                  style={{
                                    textDecoration: "none",
                                    color: "#fff",
                                    backgroundColor: "blue",
                                    borderRadius: "20px",
                                    padding: "4px 10px",
                                  }}
                                  href={`${API_ENDPOINT}/${order.labelPath}`}
                                  download={true}
                                  onClick={(e) => handleRowDownload(e, order.labelPath, order)}
                                >
                                  <i className="fa-solid fa-download pr-2"></i>{" "}
                                  Label
                                </a>
                              ) : (
                                <a
                                  style={{
                                    textDecoration: "none",
                                    color: "#fff",
                                    backgroundColor: "blue",
                                    borderRadius: "20px",
                                    padding: "4px 10px",
                                  }}
                                >
                                  <i className="fa-solid fa-download pr-2"></i>{" "}
                                  Label
                                </a>
                              )}
                            </td>

                            <td>{order.marketPlaceOrderNumber}</td>
                            <td>{order.client.clientName}</td>
                            <td>{formatDateTime(order.createdAt)}</td>

                            <td>
                              <img
                                src={`${API_ENDPOINT}/${order?.product?.filePath}`}
                                alt="product-img"
                                width={50}
                                height={50}
                                onClick={() => {
                                  console.log("clicked");
                                  handleClickOpen();
                                  setImageName(
                                    `${API_ENDPOINT}/${order?.product?.filePath}`
                                  );
                                }}
                              />
                              <p className="c_name">
                                {order.product?.productName}
                                <span className="badge badge-default m-l-10 hidden-sm-down" />
                              </p>
                            </td>

                            <td>
                              <address>
                                <i className="zmdi zmdi-pin"></i>
                                {order.product?.productSKU}
                              </address>
                            </td>
                            <td>{order.marketPlace || "-"}</td>
                            <td>{order.status || "-"}</td>
                            <td>{order.shippingMethod || "-"}</td>
                            <td>
                              <span className="phone">
                                <i className="zmdi zmdi-phone m-r-10"></i>
                                {order.quantity}
                              </span>
                            </td>
                            <td>{order.packingCharge ?? "-"}</td>
                            <td>{order.shippingCharge ?? "-"}</td>
                            <td>{order.totalPrice ?? "-"}</td>
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
          <div className="page-actions-bar">
            <div
              style={{
                fontSize: "18px",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              {selectAll
                ? totalDocs
                : orders.filter((order) => order.selected).length}{" "}
              /{totalDocs} Orders Selected
            </div>

            <Button
              variant="contained"
              color="info"
              component="label"
              style={{
                borderRadius: "10px",
                marginTop: "0px",
                textTransform: "capitalize",
              }}
              onClick={handleDownloadLabels}
            >
              Download Labels
            </Button>
          </div>
        </div>
        <Snackbar
          open={snackOpen}
          autoHideDuration={10000}
          onClose={handleSnackClose}
        >
          <Alert
            onClose={handleSnackClose}
            severity={snackType}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snack}
          </Alert>
        </Snackbar>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <img
              style={{ width: "100%" }}
              src={`${imageName}`}
              alt="product "
            />
          </Box>
        </Modal>

        <Modal
          open={open2}
          onClose={() => { }}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(90vw, 640px)",
              bgcolor: "background.paper",
              border: "2px solid #fff !important",
              boxShadow: 24,
              padding: "16px",
            }}
          >
            <Typography variant="h6" gutterBottom align="center">
              {modalTitle}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={percentCompleted}
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {`${Math.round(percentCompleted)}%`}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" align="center">
              Requested on {formatDateTime(requestedDateTime)}
            </Typography>
          </Box>
        </Modal>

        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loaderOpen}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <Modal
          open={warningOpen}
          onClose={() => setWarningOpen(false)}
          aria-labelledby="warning-modal-title"
          aria-describedby="warning-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(90vw, 400px)",
              bgcolor: "background.paper",
              border: "none",
              borderRadius: "12px",
              boxShadow: 24,
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography id="warning-modal-title" variant="h6" component="h2" sx={{ color: "#d32f2f", fontWeight: "bold", mb: 2 }}>
              Attention Required
            </Typography>
            <Typography id="warning-modal-description" sx={{ whiteSpace: "pre-line", mb: 3 }}>
              {warningMsg}
            </Typography>
            <Button
              variant="contained"
              onClick={() => setWarningOpen(false)}
              sx={{
                backgroundColor: "#1341E8",
                textTransform: "none",
                borderRadius: "20px",
                px: 4,
              }}
            >
              Understand
            </Button>
          </Box>
        </Modal>
      </div>
    </div>
  );
}
