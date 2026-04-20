import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";
import { API_ENDPOINT } from "../util";
import { Alert, Snackbar } from "@mui/material";

export default function Lpf() {
  const [file, setFile] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [snack, setSnack] = React.useState("");
  const [snackType, setSnackType] = React.useState("success");

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]; // Get the first file from the input

    // Check if a file is selected
    if (selectedFile) {
        const fileName = selectedFile.name;
        const fileType = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase(); // Get the file extension
        
        // Check if the file type is not 'xlsx' or 'csv'
        if (fileType !== 'xlsx' && fileType !== 'csv') {
            // alert('Please select an Excel file (.xlsx) or CSV file.');
            setSnack("Please select an Excel file (.xlsx) or CSV file.");
            setSnackType("error");
            handleClick();            
            event.target.value = null; // Reset the input field
            return;
        }
    }

    // If no file is selected or the file is of the correct type, update the state
    setFile(selectedFile);
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const formData = new FormData();
      formData.append("excelFile", file);

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/products/upload/add`,
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
        console.log("File uploaded successfully:", data.message);
        setSnackType("success");
        setSnack(data.message);
        setFile("");
        handleClick()
      } else {
        console.error("Failed to upload file:", data.message);
        setSnackType("error");
        setSnack(data.message);
        setFile("");
        handleClick()
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div id="main-content">
      <div className="container-fluid">
        <div className="card">
          <div className="header">
            <h4 className="head01 mt-3 mb-5">Latest Product File</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="exampleFormControlFile1">Upload File</label>
                <input
                  type="file"
                  className="form-control-file"
                  id="exampleFormControlFile1"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <button type="submit" className="sub-button">
                Submit
              </button>
            </form>
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
    </div>
  );
}
