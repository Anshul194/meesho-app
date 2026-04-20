import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";
import { API_ENDPOINT } from "../util";
import { Alert, Snackbar } from "@mui/material";

export default function Add() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [orders, setOrders] = useState([]);

  const [amount, setAmount] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");
  const [remarks, setRemarks] = useState("");
  const [addOrLess, setAddOrLess] = useState("");
  const [open, setOpen] = React.useState(false);
  const [snack, setSnack] = React.useState("");
  const [snackType, setSnackType] = React.useState("success");
  const [orderId, setOrderId] = React.useState("");
  const [itemId, setItemId] = React.useState("");
  

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/clients/selected/all`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      // Update the state with the fetched clients
      setClients(data.data); // Assuming your API response contains an array of clients
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    // Fetch orders associated with the selected client
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/v1/orders/selected/all?clientId=${selectedClient}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": localStorage.getItem("token"),
            },
          }
        );
        const data = await response.json();
        // Update the state with the fetched orders
        setOrders(data.data); // Assuming your API response contains an array of orders
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (selectedClient) {
      fetchOrders();
    }
  }, [selectedClient]);

  const handleClientChange = (event) => {
    setSelectedClient(event.target.value);
    console.log(event.target.value);
  };



  const handleOrderChange = (event) => {
    setSelectedOrder(event.target.value);

    const selectedOrderIds = event.target.value.split(",");

    if (selectedOrderIds.length === 1) {
      setOrderId(selectedOrderIds[0]);
      setItemId(null);
    } else {
      setOrderId(selectedOrderIds[0]);
      setItemId(selectedOrderIds[1]);
    }
  };

  const handleAddOrLessChange = (event) => {
    setAddOrLess(event.target.value); // Update the "Add/Less" option
  };

  const handleSave = async () => {
    // Construct data object
    const data = {
      client: selectedClient,
      amount,
      order: orderId,
      item: itemId, // Pass the selected order ID
      remarks,
      addOrLess,
    };

    try {
      // Make API call to add transaction
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/transactions/add-wallet-update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token"),
          },
          body: JSON.stringify(data),
        }
      );
      const data1 = await response.json();
      // Check if the request was successful
      if (data1.success) {
        console.log("Transaction added successfully!");
        // Clear form fields after successful submission
        setAmount("");
        setSelectedOrder(""); // Reset the selected order ID
        setRemarks("");
        setAddOrLess("");
        setSelectedClient("");

        setSnack(data1.message);
        setSnackType("success");
        handleClick();
      } else {
        setSnack(data1.message);
        setSnackType("error");
        handleClick();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <div id="main-content">
      <div className="container-fluid">
        <div className="card">
          <div className="header">
            <div className="row mt-3">
              <div className="col-sm-6">
                <div className="form-group">
                  <label for="exampleFormControlSelect1">Select Client</label>
                  <select
                    className="form-control"
                    id="exampleFormControlSelect1"
                    onChange={handleClientChange}
                    value={selectedClient}
                    required
                  >
                    <option value="">Select Client</option>

                    {clients &&
                      clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {client.clientName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label for="exampleFormControlSelect1">Select Add/Less</label>
                  <select
                    className="form-control"
                    id="exampleFormControlSelect2"
                    onChange={handleAddOrLessChange}
                    value={addOrLess}
                    required
                  >
                    <option value="">Select </option>
                    <option value="add">Add</option>
                    <option value="less">Less</option>
                  </select>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label for="exampleFormControlInput1">Enter Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    id="exampleFormControlInput1"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label htmlFor="exampleFormControlSelect3">
                    Market Place Order Number
                  </label>
                  <select
                    className="form-control"
                    id="exampleFormControlSelect3"
                    // Set the value to the selected order ID
                    value={selectedOrder}
                    onChange={handleOrderChange} // Handle order selection
                    required
                  >
                    <option value="">Select Market Place Order Number</option>
                    {/* {orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <option key={order._id} value={order._id}>
                          {order.marketPlaceOrderNumber}
                        </option>
                      ))
                    ) : (
                      <option disabled>No orders available</option>
                    )} */}

                    {orders && orders.length > 0 ? (
                      orders.map((order) =>
                        order.revisions && order.revisions === 1 ? (
                          order.orders.map((subOrder) => (
                            <option
                              key={subOrder._id}
                              value={`${order._id},${subOrder._id}`}
                            >
                              {subOrder.marketPlaceOrderNumber}
                            </option>
                          ))
                        ) : (
                          <option key={order._id} value={order._id}>
                            {order.marketPlaceOrderNumber}
                          </option>
                        )
                      )
                    ) : (
                      <option disabled>No orders available</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label for="exampleFormControlTextarea1">Enter Remarks</label>
              <textarea
                className="form-control"
                id="exampleFormControlTextarea1"
                rows="3"
                placeholder="Enter Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
            </div>
            <button className="sub-button" onClick={handleSave}>
              Save
            </button>
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
      </div>
    </div>
  );
}
