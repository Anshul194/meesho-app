import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";
import { API_ENDPOINT } from "../util";
import { Alert, Snackbar } from "@mui/material";
import Select from "react-select";

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
          `${API_ENDPOINT}/api/v1/orders/selected/all?clientId=${selectedClient}&exportAll=true`,
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

  const handleClientChange = (selectedOption) => {
    setSelectedClient(selectedOption ? selectedOption.value : "");
    console.log(selectedOption ? selectedOption.value : "");
  };

  const handleOrderChange = (selectedOption) => {
    if (!selectedOption) {
      setSelectedOrder("");
      setOrderId("");
      setItemId(null);
      return;
    }
    const value = selectedOption.value;
    setSelectedOrder(value);

    const selectedOrderIds = value.split(",");

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
                  <Select
                    options={clients && clients.map((client) => ({
                      value: client._id,
                      label: client.clientName,
                    }))}
                    onChange={handleClientChange}
                    value={
                      clients &&
                      clients
                        .map((client) => ({
                          value: client._id,
                          label: client.clientName,
                        }))
                        .find((option) => option.value === selectedClient)
                    }
                    placeholder="Select Client"
                    isClearable
                  />
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
                  <Select
                    options={
                      orders &&
                      orders.flatMap((order) =>
                        order.revisions && order.revisions === 1
                          ? order.orders.map((subOrder) => ({
                            value: `${order._id},${subOrder._id}`,
                            label: subOrder.marketPlaceOrderNumber,
                          }))
                          : [
                            {
                              value: order._id,
                              label: order.marketPlaceOrderNumber,
                            },
                          ]
                      )
                    }
                    onChange={handleOrderChange}
                    value={
                      orders &&
                      orders
                        .flatMap((order) =>
                          order.revisions && order.revisions === 1
                            ? order.orders.map((subOrder) => ({
                              value: `${order._id},${subOrder._id}`,
                              label: subOrder.marketPlaceOrderNumber,
                            }))
                            : [
                              {
                                value: order._id,
                                label: order.marketPlaceOrderNumber,
                              },
                            ]
                        )
                        .find((option) => option.value === selectedOrder)
                    }
                    placeholder="Select Market Place Order Number"
                    isClearable
                    noOptionsMessage={() => (selectedClient ? "No orders available" : "Please select a client first")}
                  />
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
