import React, { useState } from "react";
import qrcode from "../assets/images/qr.jpg";
import { API_ENDPOINT } from "../util";
import { Alert, Backdrop, CircularProgress, Snackbar } from "@mui/material";
const AddMoney = () => {
  const [amount, setAmount] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [snack, setSnack] = React.useState("");
  const [snackType, setSnackType] = React.useState("success");
  const [open3, setOpen3] = React.useState(false);
  const handleClose3 = () => {
    setOpen3(false);
  };
  const handleOpen3 = () => {
    setOpen3(true);
  };
  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleTransactionNumberChange = (e) => {
    setTransactionNumber(e.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the first file from the input

    // Check if a file is selected
    if (file) {
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop().toLowerCase(); // Get the file extension

      // Array of allowed file extensions
      const allowedExtensions = ["jpg", "jpeg", "png"];

      // Check if the file extension is in the allowedExtensions array
      if (!allowedExtensions.includes(fileExtension)) {
        // Display an error message
        setSnackType("error");
        setSnack("Please select a JPG, JPEG, or PNG image file.");
        setOpen(true);

        // Reset the input field
        event.target.value = null;
        return;
      }
    }

    // If the selected file is valid, you can update the state or perform any other necessary actions
    // Example: Update the state with the selected file
    setScreenshot(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleOpen3()
    try {
      const token = localStorage.getItem("token");
      const clientId = localStorage.getItem("clientId");
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("transactionNumber", transactionNumber);
      formData.append("screenshot", screenshot);
      formData.append("clientId", clientId);
      formData.append("t_type", "payment_request");

      const response = await fetch(`${API_ENDPOINT}/api/v1/transactions/add`, {
        method: "POST",
        headers: {
          "x-access-token": token,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        // snackbar
        setSnack("Transaction added successfully");
        setSnackType("success");
        handleClick();
        setAmount("");
        setTransactionNumber("");
        setScreenshot(null);
        handleClose3()
 
      } else {
        console.log("Error");
        setSnackType("error");
        setSnack(data.message);
        handleClick();
        handleClose3()
      }

      console.log(data);
    } catch (error) {
      console.error("Error uploading screenshot:", error);
      handleClose3()
    }
  };

  return (
    <div id="main-content">
      <div className="container-fluid">
        <div className="card">
          <div className="header">
            <h4 className="head01 mt-3 mb-5">Add Money</h4>
            <div className="row mb-3">
              <div className="col-sm-5">
                <h3 className="ben-name">Beneficiary Name</h3>
                <p className="para01 mb-4">Style4sure</p>

                <h3 className="ben-name">Account Number</h3>
                <p className="para01 mb-4">26690200001651</p>

                <h3 className="ben-name">IFSC Code</h3>
                <p className="para01 mb-4">BARB0DUMSUR</p>
              </div>
              <div className="col-sm-7">
                <div className="d-flex flex-row justify-content-center">
                  <img src={qrcode} alt="qr code" className="image01" />
                </div>

                <div className="d-flex flex-row justify-content-center">
                  <div>
                    <h3 className="ben-name01 mt-3">UPI Id</h3>
                    <p className="para02">style4sure1-2@oksbi</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hor"></div>
            <div className="row mt-4">
              <div className="col-sm-6">
                <div className="form-group">
                  <label htmlFor="exampleFormControlInput1" className="amount">
                    Enter Amount
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="exampleFormControlInput1"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (
                        (!isNaN(value) && value > 0) ||
                        e.target.value === ""
                      ) {
                        setAmount(e.target.value);
                      }
                    }}
                    required
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label htmlFor="exampleFormControlInput2" className="amount">
                    Enter Transaction Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleFormControlInput2"
                    placeholder="Enter Transaction Number"
                    value={transactionNumber}
                    onChange={handleTransactionNumberChange}
                    required
                  />
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="exampleFormControlFile1" className="amount">
                  Upload Screenshot
                </label>
                {/* <input
                  type="file"
                  className="form-control-file"
                  id="exampleFormControlFile1"
                  onChange={handleFileChange}
                  required
                /> */}

                <input
                  type="file"
                  className="form-control-file"
                  id="exampleFormControlFile1"
                  onChange={handleFileChange}
                  accept="image/jpeg, image/jpg, image/png" // Specify accepted file types
                  required
                />
              </div>
              <button type="submit" className="add-money mt-2">
                <i className="fa-solid fa-plus pr-2"></i>Add Money
              </button>
            </form>

            <h6 className="note mt-4">Note:</h6>
            <p className="desc">
              Once you upload screenshot, please wait upto 24 hours to credit
              amount in your wallet. If still not credited then contcat us on
              9662155221
            </p>
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
  );
};

export default AddMoney;
