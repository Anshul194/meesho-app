import React, { useState } from "react";
import { API_ENDPOINT } from "../util";
import { Alert, Backdrop, CircularProgress, Snackbar } from "@mui/material";

const UploadManifest = () => {
  // State to store the selected file
  const [file, setFile] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [snack, setSnack] = React.useState("");
  const [snackType, setSnackType] = React.useState("success");
  const [loaderOpen, setLoaderOpen] = React.useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setSnack("Please select a file to upload.");
      setSnackType("error");
      handleClick();
      return;
    }
    if (!marketPlace) {
      setSnack("Please select a marketplace.");
      setSnackType("error");
      handleClick();
      return;
    }
    if (submitting) {
      return; // Prevent multiple submissions
    }
    setSubmitting(true); // Set submitting to true to disable the submit button
    setLoaderOpen(true);
    // Retrieve userId and token from localStorage
    const clientId = localStorage.getItem("clientId");
    const token = localStorage.getItem("token");

    // const currentTimeIST = new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" });
    // const currentTimeHours = parseInt(currentTimeIST.split(":")[0], 10);
    // if (currentTimeHours < 8 || currentTimeHours >= 11) {
    //     setSnack("Manifest files can only be uploaded between 8 AM to 11 AM IST.");
    //     setSnackType("error");
    //     handleClick();
    //     return;
    // }

    // Check if a file is selected
   

    // Validate file type
    if (file.type !== "application/pdf") {
      setSnack("Only PDF files are allowed.");
      setSnackType("error");
      handleClick();
      setSubmitting(false); // Reset submitting state
      return;
    }

    try {
      const formData = new FormData();
      formData.append("clientId", clientId);
      formData.append("marketPlace", marketPlace);
      formData.append("manifest", file);

      // Send a POST request to the API endpoint with token authentication
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/clients/uploadManifest`,
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
        setSnack("Manifest file uploaded successfully!");
        setSnackType("success");
        handleClick();
        setFile(null);
        event.target.reset(); // Reset the form after successful upload
      } else {
        setSnack("Failed to upload manifest file.");
        setSnackType("error");
        handleClick();
      }
    } catch (error) {
      console.error("Error uploading manifest file:", error);
      alert("An error occurred while uploading the manifest file.");
    } finally {
      setLoaderOpen(false);
      setSubmitting(false); // Reset submitting state
    }
  };

  // Function to handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  return (
    <div id="main-content">
      <div className="container-fluid">
        <div className="card">
          <div className="header">
            <h4 className="head01 mt-3 mb-4">Upload Manifest</h4>

            <form onSubmit={handleSubmit}>
              <div className="form-group col-md-4 mb-3">
                <label className="amount">Select Marketplace</label>
                <select
                  className="form-control"
                  value={marketPlace}
                  onChange={(e) => setMarketPlace(e.target.value)}
                >
                  <option value="">Select Marketplace</option>
                  {marketPlaceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="exampleFormControlFile1" className="amount">
                  Upload Manifest File (PDF only)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="form-control-file"
                  id="exampleFormControlFile1"
                  onChange={handleFileChange}
                />
              </div>

              <button type="submit" className="placeo1" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit PDF"}
              </button>
            </form>
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
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loaderOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default UploadManifest;