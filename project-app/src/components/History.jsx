import React, { useEffect, useState } from "react";

import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";
import { API_ENDPOINT, formatDateTime, getStatusColor } from "../util";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Modal,
  Pagination,
  Select as MUISelect,
  Snackbar,
  Typography,
  LinearProgress,
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

export default function Dorder() {
  const [orders, setOrders] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedClient, setSelectedClient] = useState(null);

  const [searchValue, setSearchValue] = useState("");
  const [totalDocs, setTotalDocs] = useState(null);

  const [clients, setClients] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [imageName, setImageName] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snack, setSnack] = React.useState("");
  const [snackType, setSnackType] = React.useState("success");
  const [trackingFile, setTrackingFile] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [trackingData, setTrackingData] = useState({
    marketId: "",
    trackingId: "",
    trackingUrl: "",
    shippingPartnerName: "",
    trackingLabel: null
  });
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

  const [open2, setOpen2] = React.useState(false);

  const [percentCompleted, setPercentCompleted] = useState(0);
  const [requestedDateTime, setRequestedDateTime] = React.useState(null);
  const [open3, setOpen3] = React.useState(false);
  const handleClose3 = () => {
    setOpen3(false);
  };
  const handleOpen3 = () => {
    setOpen3(true);
  };
  const handleSnackOpen = () => {
    setSnackOpen(true);
  };

  const handleSnackClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackOpen(false);
  };

  const handleClickOpen2 = () => {
    setOpen2(true);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleTrackingFileChange = (event) => {
    setTrackingFile(event.target.files[0]);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setImageName(null);
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

      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const queryParams = [
        `clientId=${selectedClient || ""}`,
        `orderNumber=${searchValue}`,
        `page=${page}`,
        `limit=${rowsPerPage}`,
        `from=${startDate}`,
        `to=${endDate}`,
        `isLableDownloaded=true`,
      ];

      if (marketPlace) queryParams.push(`marketPlace=${encodeURIComponent(marketPlace)}`);

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
        handleSnackOpen();
      } else {
        console.error("Failed to fetch orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  useEffect(() => {
    fetchOrders();
    fetchClients();
  }, [selectedClient, page, rowsPerPage, marketPlace]);

  // const handleFilter = (status) => {
  //   const selectedOrders = orders.filter((order) => order.selected);

  //   // Extract the _id values of the selected orders into an array
  //   const ids = selectedOrders.map((order) => ({
  //     _id: order._id,
  //     revisions: order.revisions || 0, // Add revisions field if it exists, otherwise 0
  //   }));

  //   console.log("Updating orders with ids:", ids);

  //   // updateOrders(ids, status);
  // };

  const handleFilter = (status) => {
    let ids = [];

    orders.forEach((order) => {
      if (order.revisions && order.revisions === 1) {
        // If revisions === 1, include both the main order ID and item IDs
        // Extract and include item IDs from the orders array
        order.orders.forEach((item) => {
          if (item.selected) {
            ids.push({
              orderId: order._id,
              itemId: item._id,
              revisions: order.revisions,
            });
          }
        });
      } else {
        // For orders with no revisions or revisions !== 1, include only the main order ID
        if (order.selected) {
          ids.push({
            orderId: order._id,
            revisions: order.revisions || 0,
          });
        }
      }
    });

    console.log("Updating orders with ids:", ids);

    updateOrders(ids, status);
  };

  const updateOrders = async (ids, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_ENDPOINT}/api/v1/orders/update/`, {
        method: "POST",
        headers: {
          "x-access-token": token,
          "content-type": "application/json",
        },
        body: JSON.stringify({ ids, status }),
      });
      const data = await response.json();
      if (data.success) {
        fetchOrders();
      } else {
        console.error("Failed to update orders:", data.message);
      }
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  };

  const uploadStatusExel = async () => {
    handleOpen3();
    try {
      if (!selectedFile) {
        alert("Please select a file");
        return;
      }

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("order-excel", selectedFile);

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/orders/update/excel`,
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
        if (data.errorData) {
          console.log(data.errorData);
          exportToExcel(
            data.errorData,
            `error-file-${formatDateTime(new Date())}`
          );
        }
        setSnack(data.message);
        setSnackType("success");
        handleSnackOpen();
        fetchOrders();
      } else {
        setSnack(data.message);
        setSnackType("error");
        handleSnackOpen();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      handleClose3();
    }
  };

  const uploadTrackingExcel = async () => {
    handleOpen3();
    try {
      if (!trackingFile) {
        alert("Please select a tracking file");
        return;
      }

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("tracking-excel", trackingFile);

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/orders/update-shipping-info/excel`,
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
        setSnack(data.message);
        setSnackType("success");
        handleSnackOpen();
        fetchOrders();
      } else {
        setSnack(data.message);
        setSnackType("error");
        handleSnackOpen();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      handleClose3();
    }
  };

  const handleTrackingUpdateSubmit = async () => {
    try {
      if (!currentOrder) return;
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("orderId", currentOrder.orderId);
      if (currentOrder.itemId) formData.append("itemId", currentOrder.itemId);
      formData.append("revisions", currentOrder.revisions);
      formData.append("marketId", trackingData.marketId);
      formData.append("trackingId", trackingData.trackingId);
      formData.append("trackingUrl", trackingData.trackingUrl);
      formData.append("shippingPartnerName", trackingData.shippingPartnerName);
      if (trackingData.trackingLabel) {
        formData.append("trackingLabel", trackingData.trackingLabel);
      }

      const response = await fetch(`${API_ENDPOINT}/api/v1/orders/update-shipping-info`, {
        method: "POST",
        headers: {
          "x-access-token": token,
          // "content-type": "application/json", // FormData sets its own content-type
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setSnack(data.message);
        setSnackType("success");
        handleSnackOpen();
        setTrackingModalOpen(false);
        fetchOrders();
      } else {
        setSnack(data.message);
        setSnackType("error");
        handleSnackOpen();
      }
    } catch (error) {
      console.error("Error updating tracking:", error);
    }
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

  const applyDateFilter = () => {
    fetchOrders();
  };

  const handleCheckboxChange = (order, item) => {
    let updatedOrders;

    if (order.revisions && order.revisions === 1) {
      updatedOrders = orders.map((o) => {
        if (o._id === order._id) {
          // If revisions === 1, toggle only the selected property for the clicked item
          const updatedItems = o.orders.map((i) => {
            if (i._id === item._id) {
              return { ...i, selected: !i.selected };
            }
            return i;
          });

          return { ...o, orders: updatedItems };
        }
        return o;
      });
    } else {
      updatedOrders = orders.map((o) => {
        if (o._id === order._id) {
          return { ...o, selected: !o.selected };
        }
        return o;
      });
    }

    setOrders(updatedOrders);
  };

  const toggleSelectAll = () => {
    const updatedOrders = orders.map((order) => {
      if (order.revisions !== 1) {
        return {
          ...order,
          selected: !selectAll,
        };
      } else {
        const updatedItems = order.orders.map((item) => ({
          ...item,
          selected: !selectAll,
        }));

        return {
          ...order,
          orders: updatedItems,
        };
      }
    });

    setOrders(updatedOrders);
    setSelectAll(!selectAll);
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

  const handleExport = async () => {
    try {
      setOpen3(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/orders/selected/all?clientId=${
          selectedClient || ""
        }&orderNumber=${searchValue}&page=${page}&limit=${0}&from=${startDate}&to=${endDate}&isLableDownloaded=true`,
        {
          headers: {
            "x-access-token": token,
          },
        }
      );
      const data = await response.json();
      console.log("Excel Data:", data);
      // if (data.success) {
      //   setExcelData(data.data);
      // } else {
      //   console.error("Failed to fetch orders:", data.message);
      // }
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
            "Date & Time":
              item.status !== "Order Placed"
                ? formatDateTime(item.updatedAt)
                : formatDateTime(item.createdAt),
            "Product Name": item.product.productName,
            "Product SKU": item.product.productSKU,
            "Master SKU": item.masterSKU,
            "Product Price": item.productPrice,
            Quantity: item.quantity,
            Status: item.status,
            "Total Price": item.totalPrice,
          };
          cleanedData.push(cleanedOrder);
        }
      } else {
        const cleanedOrder = {
          "Market Place Order Number": order.marketPlaceOrderNumber,
          Client: order.client.clientName,
          "Date & Time":
            order.status !== "Order Placed"
              ? formatDateTime(order.updatedAt)
              : formatDateTime(order.createdAt),
          "Product Name": order.product.productName,
          "Product SKU": order.product.productSKU,
          "Master SKU": order.masterSKU,
          "Product Price": order.productPrice,
          Quantity: order.quantity,
          Status: order.status,
          "Total Price": order.totalPrice,
        };
        cleanedData.push(cleanedOrder);
      }
    }

    console.log("Cleaned Data:");
    console.log(cleanedData);
    exportToExcel(
      cleanedData,
      `Downloaded-Orders-${formatDateTime(new Date())}`
    );
  };
  const handleDownloadLabels = async () => {
    try {
      const selectedOrderIds = orders
        .filter((order) => {
          // Check if order.revisions exist
          if (order.revisions && order.revisions === 1) {
            // Loop through order.orders to check if any item has selected set to true
            return order.orders.some((item) => item.selected);
          } else {
            // If order.revisions doesn't exist, simply check order.selected
            return order.selected;
          }
        })
        .map((order) => order._id);

      if (selectedOrderIds.length === 0) {
        alert("Please select at least one item");
        return;
      }

      let idsToApi;

      if (selectAll) {
        // Invert the selection for selectAll case
        const deselectedOrderIds = orders
          .filter((order) => !selectedOrderIds.includes(order._id))
          .map((order) => order._id);

        idsToApi = deselectedOrderIds;
      } else {
        idsToApi = selectedOrderIds;
      }

      const token = localStorage.getItem("token");
      setRequestedDateTime(new Date());
      handleClickOpen2();

      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/orders/downloadLabels`,
        { ids: idsToApi, selectAll, isLableDownloaded: true },
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
            // Update your progress bar here using the percentCompleted value
          },
        }
      );

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
    } catch (error) {
      // Handle errors (e.g., network error, parsing error)
      // Log the error or display an error message to the user
    }
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
              </div>
            </div>

            <div className="d-flex flex-row flex-wrap mt-3">
              <button
                className="btn4"
                onClick={() => handleFilter("Right RTO Return")}
              >
                Right RTO Return
              </button>
              <button
                className="btn5"
                onClick={() => handleFilter("Right Customer Return")}
              >
                Right Customer Return
              </button>
              <button
                className="btn6"
                onClick={() => handleFilter("Wrong RTO Return")}
              >
                Wrong RTO Return
              </button>
              <button
                className="btn7"
                onClick={() => handleFilter("Wrong Customer Return")}
              >
                Wrong Customer Return
              </button>
              <button
                className="btn3"
                onClick={() => handleFilter("Cancelled")}
              >
                Cancel
              </button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginLeft: "30px",
            }}
          >
            <form>
              <div className="">
                <label htmlFor="bulkOrderFileInput" className="amount">
                  Update Status in Bulk
                </label>
                <input
                  type="file"
                  className="form-control-file"
                  id="bulkOrderFileInput"
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                />
              </div>
            </form>
            <button className="placeo1" onClick={uploadStatusExel}>
              Submit
            </button>
          </div>
          <div style={{ marginLeft: "30px", marginTop: "6px" }}>
            <a
              href={`${API_ENDPOINT}/S4S-Templates/bulk_order_status_update_template.xlsx`}
              download={true}
            >
              <h6>Download Template</h6>
            </a>
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
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Packing Charge</th>
                    <th>Shipping Method</th>
                    <th>Shipping Charge</th>
                    <th>Tracking URL</th>
                    <th>Shipping Partner</th>
                    <th>Tracking Label Doc</th>
                    <th>Shipping Label</th>
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
                                    checked={item.selected}
                                    onChange={() =>
                                      handleCheckboxChange(order, item)
                                    }
                                  />
                                  <span></span>
                                </label>
                              </td>
                              {index === 0 && (
                                <td rowSpan={order.orders.length}>
                                  {order.labelPath ? (
                                    <>
                                      <a
                                        style={{
                                          textDecoration: "none",
                                          color: "#fff",
                                          backgroundColor: "blue",
                                          borderRadius: "20px",
                                          padding: "4px 10px",
                                          marginRight: "8px",
                                        }}
                                        href={`${API_ENDPOINT}/${order.labelPath}`}
                                        download={true}
                                      >
                                        <i className="fa-solid fa-download pr-2"></i>{" "}
                                        Label
                                      </a>
                                      <button
                                        style={{
                                          textDecoration: "none",
                                          color: "#fff",
                                          backgroundColor: "#ff9800",
                                          borderRadius: "20px",
                                          padding: "4px 10px",
                                          marginRight: "8px",
                                          border: "none"
                                        }}
                                        onClick={() => {
                                          setCurrentOrder({ orderId: order._id, itemId: item._id, revisions: 1 });
                                          setTrackingData({
                                            marketId: item.marketId || "",
                                            trackingId: item.trackingId || "",
                                            trackingUrl: item.trackingUrl || "",
                                            shippingPartnerName: item.shippingPartnerName || ""
                                          });
                                          setTrackingModalOpen(true);
                                        }}
                                      >
                                        <i className="fa-solid fa-truck pr-2"></i> Tracking URL
                                      </button>
                                      {order.shippingLabelPath && (
                                        <button
                                          style={{
                                            background: "#4caf50",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "10px",
                                            padding: "4px 10px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() => window.open(`${API_ENDPOINT}/${order.shippingLabelPath.replace(/\\/g, '/')}`, '_blank')}
                                        >
                                          Preview Shipping Label
                                        </button>
                                      )}
                                    </>
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
                              {item.status !== "Order Placed" ? (
                                <td>{formatDateTime(item.updatedAt)}</td>
                              ) : (
                                <td>{formatDateTime(item.createdAt)}</td>
                              )}
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
                              <td>
                                <span className="phone">
                                  <i className="zmdi zmdi-phone m-r-10"></i>
                                  {item.quantity}
                                </span>
                              </td>
                              {/* <td>
                                <span className="phone">
                                  <i className="zmdi zmdi-phone m-r-10"></i>
                                  {item.status}
                                </span>
                              </td> */}
                              <td
                                style={{ color: getStatusColor(item.status) }}
                              >
                                {item.status}
                              </td>
                              <td>
                                <span className="phone">
                                  <i className="zmdi zmdi-phone m-r-10"></i>
                                  {item.productPrice}
                                </span>
                              </td>
                              <td>
                                <span className="phone">
                                  <i className="zmdi zmdi-phone m-r-10"></i>
                                  {item.packingCharge}
                                </span>
                              </td>
                              <td>{item.shippingMethod || ""}</td>
                              <td>{item.shippingCharge !== undefined ? item.shippingCharge : ""}</td>
                              <td>
                                {item.trackingUrl ? (
                                  <a href={item.trackingUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px' }}>
                                    {item.trackingId || 'View Tracking'}
                                  </a>
                                ) : (
                                  <span style={{ color: '#aaa', fontSize: '10px' }}>No Tracking</span>
                                )}
                              </td>
                              <td>
                                {item.shippingPartnerName || <span style={{ color: '#aaa', fontSize: '10px' }}>-</span>}
                              </td>
                              <td>
                                {item.trackingLabelPath ? (
                                  <button
                                    style={{
                                      background: "#ff9800",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "10px",
                                      padding: "4px 10px",
                                      cursor: "pointer",
                                      fontSize: "12px",
                                    }}
                                    onClick={() => window.open(`${API_ENDPOINT}/${item.trackingLabelPath.replace(/\\/g, '/')}`, '_blank')}
                                  >
                                    Preview Label
                                  </button>
                                ) : (
                                  <span style={{ color: '#aaa', fontSize: '10px' }}>No Doc</span>
                                )}
                              </td>
                              <td>
                                {order.shippingLabelPath ? (
                                  <button
                                    style={{
                                      background: "#4caf50",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "10px",
                                      padding: "4px 10px",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => window.open(`${API_ENDPOINT}/${order.shippingLabelPath.replace(/\\/g, '/')}`, '_blank')}
                                  >
                                    Preview Shipping Label
                                  </button>
                                ) : (
                                  <span style={{ color: '#aaa', fontSize: '12px' }}>No Shipping Label</span>
                                )}
                              </td>
                              <td>
                                <span className="phone">
                                  <i className="zmdi zmdi-phone m-r-10"></i>
                                  {item.totalPrice}
                                </span>
                              </td>
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
                              {order.labelPath ? (
                                <>
                                  <a
                                    style={{
                                      textDecoration: "none",
                                      color: "#fff",
                                      backgroundColor: "blue",
                                      borderRadius: "20px",
                                      padding: "4px 10px",
                                      marginRight: "8px",
                                    }}
                                    href={`${API_ENDPOINT}/${order.labelPath}`}
                                    download={true}
                                  >
                                    <i className="fa-solid fa-download pr-2"></i>{" "}
                                    Label
                                  </a>
                                  <button
                                    style={{
                                      textDecoration: "none",
                                      color: "#fff",
                                      backgroundColor: "#ff9800",
                                      borderRadius: "20px",
                                      padding: "4px 10px",
                                      marginRight: "8px",
                                      border: "none",
                                      marginTop: "4px"
                                    }}
                                    onClick={() => {
                                      setCurrentOrder({ orderId: order._id, revisions: 0 });
                                      setTrackingData({
                                        marketId: order.marketId || "",
                                        trackingId: order.trackingId || "",
                                        trackingUrl: order.trackingUrl || "",
                                        shippingPartnerName: order.shippingPartnerName || ""
                                      });
                                      setTrackingModalOpen(true);
                                    }}
                                  >
                                    <i className="fa-solid fa-truck pr-2"></i> Tracking URL
                                  </button>
                                  {order.shippingLabelPath && (
                                    <button
                                      style={{
                                        background: "#4caf50",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "10px",
                                        padding: "4px 10px",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => window.open(`${API_ENDPOINT}/${order.shippingLabelPath.replace(/\\/g, '/')}`, '_blank')}
                                    >
                                      Preview Shipping Label
                                    </button>
                                  )}
                                </>
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
                            {order.status !== "Order Placed" ? (
                              <td>{formatDateTime(order.updatedAt)}</td>
                            ) : (
                              <td>{formatDateTime(order.createdAt)}</td>
                            )}

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
                            <td>
                              <span className="phone">
                                <i className="zmdi zmdi-phone m-r-10"></i>
                                {order.quantity}
                              </span>
                            </td>

                            <td style={{ color: getStatusColor(order.status) }}>
                              {order.status}
                            </td>
                            <td>
                              <span className="phone">
                                <i className="zmdi zmdi-phone m-r-10"></i>
                                {order.productPrice}
                              </span>
                            </td>
                            <td>
                              <span className="phone">
                                <i className="zmdi zmdi-phone m-r-10"></i>
                                {order.packingCharge}
                              </span>
                            </td>
                            <td>{order.shippingMethod || ""}</td>
                            <td>{order.shippingCharge !== undefined ? order.shippingCharge : ""}</td>
                            <td>
                              {order.trackingUrl ? (
                                <a href={order.trackingUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px' }}>
                                  {order.trackingId || 'View Tracking'}
                                </a>
                              ) : (
                                <span style={{ color: '#aaa', fontSize: '10px' }}>No Tracking</span>
                              )}
                            </td>
                            <td>
                              {order.shippingPartnerName || <span style={{ color: '#aaa', fontSize: '10px' }}>-</span>}
                            </td>
                            <td>
                              {order.trackingLabelPath ? (
                                <button
                                  style={{
                                    background: "#ff9800",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "10px",
                                    padding: "4px 10px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                  }}
                                  onClick={() => window.open(`${API_ENDPOINT}/${order.trackingLabelPath.replace(/\\/g, '/')}`, '_blank')}
                                >
                                  Preview Label
                                </button>
                              ) : (
                                <span style={{ color: '#aaa', fontSize: '10px' }}>No Doc</span>
                              )}
                            </td>
                            <td>
                              {order.shippingLabelPath ? (
                                <button
                                  style={{
                                    background: "#4caf50",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "10px",
                                    padding: "4px 10px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => window.open(`${API_ENDPOINT}/${order.shippingLabelPath.replace(/\\/g, '/')}`, '_blank')}
                                >
                                  Preview Shipping Label
                                </button>
                              ) : (
                                <span style={{ color: '#aaa', fontSize: '12px' }}>No Shipping Label</span>
                              )}
                            </td>
                            <td>
                              <span className="phone">
                                <i className="zmdi zmdi-phone m-r-10"></i>
                                {order.totalPrice}
                              </span>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                </tbody>
              </table>
            </div>
            {/* <div
              style={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center",
                gap: "20px",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  color: "#000",
                  fontWeight: "bold",
                }}
              >
                {orders.filter((order) => order.selected).length} /
                {orders.length} Orders Selected
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
            </div> */}
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center",
                gap: "20px",
                marginTop: "10px",
                position: "fixed",
                bottom: "0px",
                left: "0px",
                right: "0px",
                background:
                  "linear-gradient(90deg, hsla(213, 62%, 45%, 1) 0%, hsla(0, 0%, 96%, 1) 0%, hsla(203, 89%, 71%, 1) 100%)",
                padding: "10px 10px 10px 10px",
                borderRadius: "10px",
              }}
            >
              {/* <div
                style={{
                  fontSize: "18px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {orders.filter((order) => order.selected).length} /{totalDocs}{" "}
                Orders Selected
              </div> */}
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
              src={`${imageName}`}
              alt="product "
            />
          </Box>
        </Modal>

        <Modal
          open={trackingModalOpen}
          onClose={() => setTrackingModalOpen(false)}
        >
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Update Tracking URL
            </Typography>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div className="form-group">
                <label>Market Id</label>
                <input
                  className="form-control"
                  value={trackingData.marketId}
                  onChange={(e) => setTrackingData({ ...trackingData, marketId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tracking ID</label>
                <input
                  className="form-control"
                  value={trackingData.trackingId}
                  onChange={(e) => setTrackingData({ ...trackingData, trackingId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tracking URL</label>
                <input
                  className="form-control"
                  value={trackingData.trackingUrl}
                  onChange={(e) => setTrackingData({ ...trackingData, trackingUrl: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Shipping Partner Name</label>
                <input
                  className="form-control"
                  value={trackingData.shippingPartnerName}
                  onChange={(e) => setTrackingData({ ...trackingData, shippingPartnerName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tracking Label (File)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setTrackingData({ ...trackingData, trackingLabel: e.target.files[0] })}
                />
              </div>
              <Button variant="contained" color="warning" onClick={handleTrackingUpdateSubmit}>
                Update
              </Button>
            </div>
          </Box>
        </Modal>
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
        open={open2}
        onClose={() => {}}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            bgcolor: "background.paper",
            border: "2px solid #fff !important",
            boxShadow: 24,
            padding: "16px",
          }}
        >
          <Typography variant="h6" gutterBottom align="center">
            Generating Labels...
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ width: "100%", mr: 1 }}>
              <LinearProgress variant="determinate" value={percentCompleted} />
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
        open={open3}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
