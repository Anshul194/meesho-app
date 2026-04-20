import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";
import { API_ENDPOINT, formatDateTime } from "../util";
import {
  Button,
  MenuItem,
  Pagination,
  Select as MUISelect,
  Snackbar,
  Alert,
} from "@mui/material";
import Select from "react-select";
export default function Dmani() {
  const [manifests, setManifests] = useState([]);

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(null);

  const [open, setOpen] = React.useState(false);
  const [snack, setSnack] = React.useState("");
  const [snackType, setSnackType] = React.useState("success");

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
    setPage(1);
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/clients/manifest/all?clientId=${selectedClient}&page=${page}&limit=${rowsPerPage}&from=${startDate}&to=${endDate}`,
        {
          headers: {
            "x-access-token": token,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setManifests(data?.data);
        setTotalDocs(data?.totalManifests);
        setSnack(data?.message);
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
    fetchClients();
    fetchOrders();
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

  const downloadManifest = async (id) => {
    try {
      setSelectAll(false);

      // Check if manifests is available and not undefined
      if (manifests && manifests.length > 0) {
        const selectedOrderIds = manifests
          .filter((order) => order._id === id)
          .map((order) => order._id);

        await DownloadLabels(selectedOrderIds);
      } else {
        console.error("Manifests are not available or empty");
      }
    } catch (error) {
      console.error("Error downloading manifest:", error);
    }
  };

  const handleDownloadLabels = async () => {
    try {
      // Check if manifests is available and not undefined
      if (manifests && manifests.length > 0) {
        const selectedOrderIds = manifests
          .filter((order) => order.selected)
          .map((order) => order._id);

        await DownloadLabels(selectedOrderIds);
      } else {
        console.error("Manifests are not available or empty");
      }
    } catch (error) {
      console.error("Error downloading labels:", error);
    }
  };

  const DownloadLabels = async (selectedOrderIds) => {
    try {
      // Get the _id of selected orders

      if (selectedOrderIds.length === 0) {
        alert("Please select at least one item");
        return;
      }

      // call API to download labels for selected orders
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/clients/downloadManifest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({ ids: selectedOrderIds }),
        }
      );

      // Check if the response is successful
      if (response.ok) {
        // Trigger the download of the merged PDF file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "manifests.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        fetchOrders();

        // Provide feedback to the user that the download is complete
        // Hide loading spinner or update message
      } else {
        // Handle unsuccessful response (e.g., server error)
        // Provide feedback to the user about the error
      }
    } catch (error) {
      // Handle errors (e.g., network error, parsing error)
      // Log the error or display an error message to the user
    }
  };

  const handleCheckboxChange = (order) => {
    const updatedOrders = manifests.map((o) => {
      if (o._id === order._id) {
        return { ...o, selected: !o.selected };
      }
      return o;
    });
    setManifests(updatedOrders);
  };

  const toggleSelectAll = () => {
    if (!manifests || manifests.length === 0) {
      // Handle the case where manifests is undefined or empty
      return;
    }

    const updatedOrders = manifests.map((order) => {
      return {
        ...order,
        selected: !selectAll,
      };
    });

    setManifests(updatedOrders);
    setSelectAll(!selectAll);
  };

  const applyDateFilter = () => {
    fetchOrders();
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
                    <th>Client Name</th>
                    <th>Manifest</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {manifests &&
                    manifests.map((manifest) => (
                      <tr key={manifest._id}>
                        <td style={{ width: "50px" }}>
                          <label className="fancy-checkbox">
                            <input
                              className="checkbox-tick"
                              type="checkbox"
                              name="checkbox"
                              checked={manifest.selected}
                              onChange={() => handleCheckboxChange(manifest)}
                            />
                            <span></span>
                          </label>
                        </td>
                        <td>
                          {manifest.client ? manifest.client.clientName : "N/A"}
                        </td>
                        {manifest.isDownloaded ? (
                          <td
                            onClick={() => downloadManifest(manifest._id)}
                            style={{
                              cursor: "pointer",
                              color: "green",
                              fontWeight: "bold",
                            }}
                          >
                            Downloaded
                          </td>
                        ) : (
                          <td
                            onClick={() => downloadManifest(manifest._id)}
                            style={{
                              cursor: "pointer",
                              color: "blue",
                              fontWeight: "bold",
                            }}
                          >
                            Download
                          </td>
                        )}

                        <td>{formatDateTime(manifest.createdAt)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

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
              <div
                style={{
                  fontSize: "18px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {manifests?.filter((order) => order.selected).length} /
                {totalDocs} Manifests Selected
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

            <Snackbar
              open={open}
              autoHideDuration={10000}
              onClose={handleClose}
            >
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
      </div>
    </div>
  );
}
