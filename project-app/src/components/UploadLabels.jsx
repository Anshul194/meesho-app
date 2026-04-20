// import React, { useState } from "react";
// import { API_ENDPOINT } from "../util";
// import { Alert, Backdrop, CircularProgress, Snackbar } from "@mui/material";

// const UploadLabels = () => {
//   // State to store the selected file
//   const [file, setFile] = useState(null);
//   const [open, setOpen] = React.useState(false);
//   const [snack, setSnack] = React.useState("");
//   const [snackType, setSnackType] = React.useState("success");
//   const [loaderOpen, setLoaderOpen] = React.useState(false);
//   const handleClick = () => {
//     setOpen(true);
//   };

//   const handleClose = (event, reason) => {
//     if (reason === "clickaway") {
//       return;
//     }

//     setOpen(false);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setLoaderOpen(true);
//     // Retrieve userId and token from localStorage
//     const clientId = localStorage.getItem("clientId");
//     const token = localStorage.getItem("token");

//     // const currentTimeIST = new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" });
//     // const currentTimeHours = parseInt(currentTimeIST.split(":")[0], 10);
//     // if (currentTimeHours < 6 || currentTimeHours >= 10) {
//     //     setSnack("Labels can only be uploaded between 6 AM to 10 AM IST.");
//     //     setSnackType("error");
//     //     handleClick();
//     //     return;
//     // }

//     // Check if a file is selected
//     if (!file) {
//       setSnack("Please select a file to upload.");
//       setSnackType("error");
//       handleClick();
//       return;
//     }

//     // Validate file type
//     if (file.type !== "application/pdf") {
//       setSnack("Only PDF files are allowed.");
//       setSnackType("error");
//       handleClick();
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("clientId", clientId);
//       formData.append("labels", file);

//       // Send a POST request to the API endpoint with token authentication
//       const response = await fetch(
//         `${API_ENDPOINT}/api/v1/clients/uploadLabels`,
//         {
//           method: "POST",
//           headers: {
//             "x-access-token": token,
//           },
//           body: formData,
//         }
//       );
//       const data = await response.json();
//       if (data.success) {
//         setSnack(data.message);
//         setSnackType("success");
//         handleClick();
//         setFile(null);
//       } else {
//         setSnack(data.message);
//         setSnackType("error");
//         handleClick();
//       }
//     } catch (error) {
//       console.error("Error uploading label file:", error);
//       alert("An error occurred while uploading the label file.");
//     }
//     finally {
//       setLoaderOpen(false);
//     }
//   };

//   // Function to handle file selection
//   const handleFileChange = (event) => {
//     const selectedFile = event.target.files[0];
//     setFile(selectedFile);
//   };

//   return (
//     <div id="main-content">
//       <div className="container-fluid">
//         <div className="card">
//           <div className="header">
//             <h4 className="head01 mt-3 mb-4">Upload Labels</h4>

//             <form onSubmit={handleSubmit}>
//               <div className="form-group">
//                 <label htmlFor="exampleFormControlFile1" className="amount">
//                   Upload Labels File (PDF only)
//                 </label>
//                 <input
//                   type="file"
//                   accept="application/pdf"
//                   className="form-control-file"
//                   id="exampleFormControlFile1"
//                   onChange={handleFileChange}
//                 />
//               </div>

//               <button type="submit" className="placeo1">
//                 Submit PDF
//               </button>
//             </form>
//           </div>
//         </div>
//         <Snackbar open={open} autoHideDuration={10000} onClose={handleClose}>
//           <Alert
//             onClose={handleClose}
//             severity={snackType}
//             variant="filled"
//             sx={{ width: "100%" }}
//           >
//             {snack}
//           </Alert>
//         </Snackbar>
//       </div>
//       <Backdrop
//         sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
//         open={loaderOpen}
//       >
//         <CircularProgress color="inherit" />
//       </Backdrop>
//     </div>
//   );
// };

// export default UploadLabels;

import React, { useState } from "react";
import { API_ENDPOINT } from "../util";
import { Alert, Backdrop, CircularProgress, Snackbar } from "@mui/material";

const UploadLabels = () => {
  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  const [snack, setSnack] = useState("");
  const [snackType, setSnackType] = useState("success");
  const [loaderOpen, setLoaderOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false); // State to track submission

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
      setSubmitting(false); // Reset submitting state
      return;
    }

    if (submitting) {
      return; // Prevent multiple submissions
    }
    setSubmitting(true); // Set submitting to true to disable the submit button

    setLoaderOpen(true);
    const clientId = localStorage.getItem("clientId");
    const token = localStorage.getItem("token");

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
      formData.append("labels", file);

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/clients/uploadLabels`,
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
        handleClick();
        setFile(null);
        event.target.reset(); // Reset the form after successful upload
      } else {
        setSnack(data.message);
        setSnackType("error");
        handleClick();
      }
    } catch (error) {
      console.error("Error uploading label file:", error);
      alert("An error occurred while uploading the label file.");
    } finally {
      setLoaderOpen(false);
      setSubmitting(false); // Reset submitting state
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  return (
    <div id="main-content">
      <div className="container-fluid">
        <div className="card">
          <div className="header">
            <h4 className="head01 mt-3 mb-4">Upload Labels</h4>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="exampleFormControlFile1" className="amount">
                  Upload Labels File (PDF only)
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

export default UploadLabels;
