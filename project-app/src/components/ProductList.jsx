import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";
import { API_ENDPOINT } from "../util";
import { Alert, Snackbar } from "@mui/material";

export default function Pu() {
  const [googleDriveURL, setGoogleDriveURL] = useState("");
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const handleURLChange = (e) => {
    setGoogleDriveURL(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/products/upload/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({ googleDriveURL }),
        }
      );
      const data = await response.json();
      if (data.success) {
        console.log("Google Drive URL submitted successfully:", data.message);
        handleClick()
        setGoogleDriveURL("")
      } else {
        console.error("Failed to submit Google Drive URL:", data.message);
      }
    } catch (error) {
      console.error("Error submitting Google Drive URL:", error);
    }
  };

  return (
    <div id="main-content">
      <div className="container-fluid">
        <div className="card">
          <div className="header">
            <h4 className="head01 mt-3 mb-5">Products URL</h4>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="exampleFormControlFile1">
                      Enter Google Drive URL
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlFile1"
                      placeholder="Google Drive URL"
                      value={googleDriveURL}
                      onChange={handleURLChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="sub-button">
                Submit
              </button>
            </form>
          </div>
        </div>
        <Snackbar open={open} autoHideDuration={10000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Product File URL Updated Successfully!
        </Alert>
      </Snackbar>
      </div>
    </div>
  );
}
