import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/css/main.css";
import "../assets/vendor/bootstrap/css/bootstrap.css";
import "../assets/vendor/font-awesome/css/font-awesome.min.css";
import "../assets/vendor/toastr/toastr.min.css";
import "../assets/vendor/charts-c3/plugin.css";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Modal,
  Pagination,
  Snackbar,
  Select as MUISELECT,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import Select from "react-select";
import { API_ENDPOINT } from "../util";

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

export default function Pl() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [open4, setOpen4] = React.useState(false);
  const [imageName, setImageName] = React.useState("");
  const [searchInput, setSearchInput] = useState("");
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snack, setSnack] = React.useState("");
  const [snackType, setSnackType] = React.useState("success");
  const [masterSKUData, setMasterSKUData] = useState({
    masterSKU: "",
    price: "",
  });
  const [addMasterSKU, setAddMasterSKU] = React.useState(false);
  const [masterSKUs, setMasterSKUs] = useState(null);
  const [allMasterSKU, setAllMasterSKU] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [editMasterSKU, setEditMasterSKU] = useState(null);

  const [price, setPrice] = useState("");
  const [searchMasterSKUInput, setSearchMasterSKUInput] = useState("");
  const [selectedMasterSKU, setSelectedMasterSKU] = useState(null);
  const [loaderOpen, setLoaderOpen] = React.useState(false);
  // Filter Master SKUs based on the search input

  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkMaterSkuUploadOpen, setBulkMaterSkuUploadOpen] = useState(false);
  const [bulkMaterSkuFile, setBulkMaterSkuFile] = useState(null);

  const handleSnackOpen = () => {
    setSnackOpen(true);
  };

  const handleSnackClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackOpen(false);
  };

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset page to 1 when rows per page changes
  };

  const [page1, setPage1] = useState(1);
  const [rowsPerPage1, setRowsPerPage1] = useState(10);

  const handlePageChange1 = (event, value) => {
    setPage1(value);
  };

  const handleRowsPerPageChange1 = (event) => {
    setRowsPerPage1(event.target.value);
    setPage1(1); // Reset page to 1 when rows per page changes
  };

  const [formData, setFormData] = useState({
    productName: "",
    productSKU: "",
    price: "",
    picture: null,
    masterSKU: null,
  });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isWindowWidth576 = () => {
    return windowWidth <= 576;
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleClickOpen = (product) => {
    setEditProduct(product);
    setOpen3(true);
  };

  const handleClickOpen1 = (product) => {
    setEditMasterSKU(product);
    setOpen4(true);
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/products/selected/all`,
        {
          headers: {
            "x-access-token": token,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        console.error("Failed to fetch products:", data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  useEffect(() => {
    fetchProducts();
    fetchMasterSKUs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        setSnackType("error");
        setSnack("Please select a JPG, JPEG, or PNG image file.");
        handleSnackOpen();

        event.target.value = null; // Reset the input field
        return;
      }
    }

    // If the selected file is valid, update the state
    setFormData({ ...formData, picture: file });
  };

  const handleFileChange1 = (event) => {
    const file = event.target.files[0]; // Get the first file from the input

    // Check if a file is selected
    if (file) {
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop().toLowerCase(); // Get the file extension

      // Array of allowed file extensions
      const allowedExtensions = ["jpg", "jpeg", "png"];

      // Check if the file extension is in the allowedExtensions array
      if (!allowedExtensions.includes(fileExtension)) {
        setSnackType("error");
        setSnack("Please select a JPG, JPEG, or PNG image file.");
        handleSnackOpen();

        event.target.value = null; // Reset the input field
        return;
      }
    }
    setEditProduct((prevEditProduct) => ({
      ...prevEditProduct,
      picture: file,
    }));
  };

  const handleSubmit = async (e) => {
    setLoaderOpen(true);
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const form = new FormData();
      form.append("productName", formData.productName);
      form.append("productSKU", formData.productSKU);
      form.append("price", price);
      form.append("image", formData.picture);
      form.append("masterSKU", formData.masterSKU);

      const response = await fetch(`${API_ENDPOINT}/api/v1/products/add`, {
        method: "POST",
        headers: {
          "x-access-token": token,
        },
        body: form,
      });
      const data = await response.json();
      if (data.success) {
        // Optionally, you can update the products list here
        console.log("Product created successfully:", data.message);
        setSnack(data.message);
        setSnackType("success");
        handleSnackOpen();
        setFormData({
          productName: "",
          productSKU: "",
          price: "",
          picture: null,
          masterSKU: null,
        });
        setImageName("");
        fetchProducts();
        setPrice("");
        setMasterSKUs([]);
        fetchMasterSKUs();
        setSelectedMasterSKU(null);
        setLoaderOpen(false);
      } else {
        console.error("Failed to create product:", data.message);
        setSnack(data.message);
        setSnackType("error");
        handleSnackOpen();
        setLoaderOpen(false);
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  // make a function which calls to this endpoint `${API_ENDPOINT}/api/v1/products/add/master-sku`
  // with required params and handle response
  const addMasterSKU1 = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const form = {
        masterSKU: masterSKUData.masterSKU,
        price: masterSKUData.price,
      };
      if (!form.masterSKU || !form.price) {
        throw new Error("Please fill all the fields");
      }

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/products/add/master-sku`,
        {
          method: "POST",
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();

      if (data.success) {
        console.log("Master SKU added successfully:", data.message);
        setSnack(data.message);
        setSnackType("success");
        handleSnackOpen();
        setAddMasterSKU(false);
        fetchMasterSKUs();
        setOpen2(false);
        setMasterSKUData({
          masterSKU: "",
          price: "",
        });
      } else {
        console.error("Failed to add master SKU:", data.message);
        setSnack(data.message);
        setSnackType("error");
        handleSnackOpen();
      }
    } catch (error) {
      console.error("Error adding master SKU:", error);
      setSnack(error.message);
      setSnackType("error");
      handleSnackOpen();
    }
  };

  const updateMasterSKU = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const form = {
        masterSKU: editMasterSKU.masterSKU,
        price: editMasterSKU.price,
        _id: editMasterSKU._id,
      };
      if (!form.masterSKU || !form.price) {
        throw new Error("Please fill all the fields");
      }

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/products/update/master-sku`,
        {
          method: "POST",
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();

      if (data.success) {
        console.log("Master SKU updated successfully:", data.message);
        setSnack(data.message);
        setSnackType("success");
        handleSnackOpen();
        setAddMasterSKU(false);
        fetchMasterSKUs();
        fetchProducts();
        setOpen4(false);
      } else {
        console.error("Failed to add master SKU:", data.message);
        setSnack(data.message);
        setSnackType("error");
        handleSnackOpen();
      }
    } catch (error) {
      console.error("Error adding master SKU:", error);
      setSnack(error.message);
      setSnackType("error");
      handleSnackOpen();
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      if (!editProduct.productName || !editProduct.productSKU) {
        throw new Error("Please fill all the fields");
      }

      const form = new FormData();
      form.append("productName", editProduct.productName);
      form.append("productSKU", editProduct.productSKU);
      form.append("_id", editProduct._id);
      form.append("image", editProduct.picture);
      form.append("masterSKU", JSON.stringify(editProduct.masterSKU));

      const response = await fetch(`${API_ENDPOINT}/api/v1/products/update`, {
        method: "POST",
        headers: {
          "x-access-token": token,
        },
        body: form,
      });
      const data = await response.json();

      if (data.success) {
        setSnack(data.message);
        setSnackType("success");
        handleSnackOpen();
        setAddMasterSKU(false);
        fetchMasterSKUs();
        setOpen3(false);
        fetchMasterSKUs();
        fetchProducts();
      } else {
        console.error("Failed to add master SKU:", data.message);
        setSnack(data.message);
        setSnackType("error");
        handleSnackOpen();
        setOpen3(false);
      }
    } catch (error) {
      console.error("Error adding master SKU:", error);
      setSnack(error.message);
      setSnackType("error");
      handleSnackOpen();
      setOpen3(false);
    }
  };

  const fetchMasterSKUs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/products/get/master-sku`,
        {
          headers: {
            "x-access-token": token,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        // Set the fetched master SKUs to state
        console.log("Master SKUs fetched successfully:", data.data);
        //make a value and label of masterSKU
        setAllMasterSKU(data.data);
        const masterSKUs = data.data.map(({ masterSKU, price }) => ({
          value: masterSKU,
          label: `${masterSKU}`,
        }));
        setMasterSKUs(masterSKUs);
      } else {
        console.error("Failed to fetch master SKUs:", data.message);
      }
    } catch (error) {
      console.error("Error fetching master SKUs:", error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const productNameMatch = product.productName
      .toLowerCase()
      .includes(searchInput.toLowerCase());
    const productSKUMatch = product.productSKU
      .toLowerCase()
      .includes(searchInput.toLowerCase());
    return productNameMatch || productSKUMatch;
  });

  const indexOfLastItem = page * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  let filteredMasterSKUs = allMasterSKU.filter((sku) =>
    sku.masterSKU.toLowerCase().includes(searchMasterSKUInput.toLowerCase())
  );

  const indexOfLastItem1 = page1 * rowsPerPage1;
  const indexOfFirstItem1 = indexOfLastItem1 - rowsPerPage1;
  const currentItems1 = filteredMasterSKUs.slice(
    indexOfFirstItem1,
    indexOfLastItem1
  );

  const handleBulkUpload = async () => {
    if (!bulkFile) return;

    setLoaderOpen(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("excelFile", bulkFile);

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/products/bulk-upload`,
        {
          method: "POST",
          headers: {
            "x-access-token": token,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        setSnack("Bulk upload successful!");
        setSnackType("success");
        fetchProducts(); // refresh list
      } else {
        setSnack(result.message || "Bulk upload failed.");
        setSnackType("error");
      }

      handleSnackOpen();
      setBulkUploadOpen(false);
      setBulkFile(null);
    } catch (err) {
      console.error("Bulk upload error:", err);
      setSnack("Something went wrong during bulk upload.");
      setSnackType("error");
      handleSnackOpen();
    } finally {
      setLoaderOpen(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/products/export-products`,
        {
          method: "GET",
          headers: {
            "x-access-token": token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleBulkUploadMasterSku = async () => {
    if (!bulkMaterSkuFile) return;

    setLoaderOpen(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("excelFile", bulkMaterSkuFile);

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/products/bulk-upload-master-sku`,
        {
          method: "POST",
          headers: {
            "x-access-token": token,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        setSnack("Bulk upload successful!");
        setSnackType("success");
        fetchProducts(); // refresh list
      } else {
        setSnack(result.message || "Bulk upload failed.");
        setSnackType("error");
      }

      handleSnackOpen();
      setBulkMaterSkuUploadOpen(false);
      setBulkMaterSkuFile(null);
    } catch (err) {
      console.error("Bulk upload error:", err);
      setSnack("Something went wrong during bulk upload.");
      setSnackType("error");
      handleSnackOpen();
    } finally {
      setLoaderOpen(false);
    }
  };

  const handleDownloadMasterSku = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/products/export-master-sku`,
        {
          method: "GET",
          headers: {
            "x-access-token": token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const downloadBulkUploadTemplate = () => {
    const templateData = [
      {
        productName: "",
        productSKU: "",
        price: "",
        masterSKU: "",
        image: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "bulk_upload_template.xlsx");
  };

  const downloadmastreSkuBulkUploadTemplate = () => {
    const templateData = [
      {
        masterSKU: "",
        price: "",
        productSKU: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "bulk_upload_template.xlsx");
  };

  return (
    <div id="main-content">
      <div className="container-fluid">
        <div className="card">
          <div className="header">
            <h4 className="head01 mt-3">Create New Product</h4>
            <form className="mt-3" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="masterSku">Master SKU</label>

                    {masterSKUs && (
                      <Select
                        options={masterSKUs}
                        isClearable
                        value={selectedMasterSKU}
                        onChange={(selected) => {
                          if (selected) {
                            setSelectedMasterSKU(selected);
                            const selectedValue = selected.value;
                            setFormData({
                              ...formData,
                              masterSKU: selectedValue,
                            });
                            const selectedPrice = allMasterSKU.find(
                              (sku) => sku.masterSKU === selectedValue
                            )?.price;
                            if (selectedPrice !== undefined) {
                              setPrice(selectedPrice);
                            } else {
                              setPrice(null);
                            }
                          } else {
                            setSelectedMasterSKU(null);
                            setFormData({
                              ...formData,
                              masterSKU: null,
                            });
                            setPrice(null);
                          }
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="col-sm-6">
                  <div
                    style={
                      isWindowWidth576
                        ? { marginTop: "30px" }
                        : { marginTop: "0px", marginBottom: "10px" }
                    }
                  >
                    <Button
                      variant="contained"
                      color="success"
                      style={{
                        borderRadius: "20px",
                        textTransform: "none",
                        backgroundColor: "#0D9E25",

                        fontWeight: "bold",
                      }}
                      onClick={() => {
                        setAddMasterSKU(true);
                        setOpen2(true);
                      }}
                    >
                      Create Master SKU
                    </Button>

                    <Button
                      variant="contained"
                      color="success"
                      style={{
                        borderRadius: "20px",
                        textTransform: "none",
                        backgroundColor: "#0D9E25",
                        marginLeft: "20px",
                        fontWeight: "bold",
                      }}
                      onClick={() => setBulkMaterSkuUploadOpen(true)}
                    >
                      Bulk Upload
                    </Button>

                    <Button
                      variant="contained"
                      color="success"
                      style={{
                        borderRadius: "20px",
                        textTransform: "none",
                        backgroundColor: "#0D9E25",
                        marginLeft: "40px",
                        fontWeight: "bold",
                      }}
                      onClick={() => downloadmastreSkuBulkUploadTemplate()}
                    >
                      Get Blank Template
                    </Button>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="productName">Product Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="productName"
                      name="productName"
                      placeholder="Product Name"
                      value={formData.productName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="productSKU">Product SKU</label>
                    <input
                      type="text"
                      className="form-control"
                      id="productSKU"
                      name="productSKU"
                      placeholder="Product SKU"
                      value={formData.productSKU}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      name="price"
                      placeholder="Price"
                      value={price}
                      required
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="picture">Upload Image</label>
                    <input
                      type="file"
                      className="form-control-file"
                      id="picture"
                      name="picture"
                      onChange={handleFileChange}
                      accept="image/*"
                      // required
                    />
                  </div>
                </div>
              </div>

              <div className="grid col-sm-6">
                {/* <button
                  variant="contained"
                  color="success"
                  style={{
                    borderRadius: "20px",
                    textTransform: "none",
                    backgroundColor: "#0D9E25",
                    fontWeight: "bold",
                    height: "38px",
                  }}
                  type="submit"
                  className="sub-button "
                >
                  Save
                </button> */}

                <Button
                  variant="contained"
                  color="success"
                  style={{
                    borderRadius: "20px",
                    textTransform: "none",
                    backgroundColor: "#0D9E25",
                    // marginLeft: "20px",
                    fontWeight: "bold",
                  }}
                  type="submit"
                >
                  Save
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  style={{
                    borderRadius: "20px",
                    textTransform: "none",
                    backgroundColor: "#0D9E25",
                    marginLeft: "20px",
                    fontWeight: "bold",
                  }}
                  onClick={() => setBulkUploadOpen(true)}
                >
                  Bulk Upload
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  style={{
                    borderRadius: "20px",
                    textTransform: "none",
                    backgroundColor: "#0D9E25",
                    marginLeft: "40px",
                    fontWeight: "bold",
                  }}
                  onClick={() => downloadBulkUploadTemplate()}
                >
                  Get Blank Template
                </Button>
              </div>
            </form>

            <div className="row">
              <div className="col-sm-6">
                <div className="col-sm-12">
                  <div className="d-flex mt-5 mb-3 justify-content-between">
                    <h4 className="head01 ">Serach Product List</h4>
                    <Button
                      variant="contained"
                      color="success"
                      style={{
                        borderRadius: "20px",
                        textTransform: "none",
                        backgroundColor: "#0D9E25",
                        marginLeft: "60px",
                        fontWeight: "bold",
                        height: "40px",
                      }}
                      onClick={() => handleDownload()}
                    >
                      Export
                    </Button>
                  </div>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Search Name or SKU"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>

                <div className="table-responsive col-sm-12">
                  <table className="table table-hover custom-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Product SKU</th>
                        <th>Master SKU</th>
                        <th>Price</th>
                        <th>Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((product) => (
                        <tr key={product._id}>
                          <td>{product.productName}</td>
                          <td>{product.productSKU}</td>
                          <td>{product.masterSKU?.masterSKU}</td>
                          <td>{product.masterSKU?.price}</td>
                          <td
                            style={{
                              color: product.fileName ? "blue" : "black",
                              cursor: product.fileName ? "pointer" : "default",
                            }}
                            onClick={() => {
                              if (product.fileName) {
                                handleOpen();
                                setImageName(product.fileName);
                              }
                            }}
                          >
                            {product.fileName
                              ? `${API_ENDPOINT}/uploads/${product.fileName}`
                                  .substring(0, 12)
                                  .concat("...")
                              : "-"}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-info"
                              title="Edit"
                              onClick={() => handleClickOpen(product)}
                            >
                              <i className="fa fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                      count={Math.ceil(filteredProducts.length / rowsPerPage)}
                      page={page}
                      onChange={handlePageChange}
                    />
                    <MUISELECT
                      value={rowsPerPage}
                      onChange={handleRowsPerPageChange}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={20}>20</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                    </MUISELECT>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="col-sm-12">
                  <div className="d-flex mt-5 mb-3 justify-content-between">
                    <h4 className="head01">Serach Master SKU List</h4>
                    <Button
                      variant="contained"
                      color="success"
                      style={{
                        borderRadius: "20px",
                        textTransform: "none",
                        backgroundColor: "#0D9E25",
                        height: "40px",
                        fontWeight: "bold",
                      }}
                      onClick={() => handleDownloadMasterSku()}
                    >
                      Export
                    </Button>
                  </div>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Search Master SKU"
                    value={searchMasterSKUInput}
                    onChange={(e) => setSearchMasterSKUInput(e.target.value)}
                  />
                </div>

                <div className=" table-responsive col-sm-12">
                  <table className="table table-hover custom-table">
                    <thead>
                      <tr>
                        <th>Master SKU</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems1.map((product) => (
                        <tr key={product._id}>
                          <td>{product.masterSKU}</td>

                          <td>{product.price}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-info"
                              title="Edit"
                              onClick={() => handleClickOpen1(product)}
                            >
                              <i className="fa fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                      count={Math.ceil(
                        filteredMasterSKUs.length / rowsPerPage1
                      )}
                      page={page1}
                      onChange={handlePageChange1}
                    />
                    <MUISELECT
                      value={rowsPerPage1}
                      onChange={handleRowsPerPageChange1}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={20}>20</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                    </MUISELECT>
                  </div>
                </div>
              </div>
            </div>
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
            src={`${API_ENDPOINT}/uploads/${imageName}`}
            alt="product "
          />
        </Box>
      </Modal>

      {addMasterSKU && (
        <Dialog
          open={open2}
          onClose={() => {
            setOpen2(false);
            setMasterSKUData({
              masterSKU: "",
              price: "",
            });
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{""}</DialogTitle>
          <DialogContent>
            <form className="mt-5" onSubmit={addMasterSKU1}>
              <div className="row">
                <h4 className="head01 mb-4">Create A New Master SKU</h4>
                <div className="form-group">
                  <label htmlFor="masterSKU">Master SKU</label>
                  <input
                    type="text"
                    className="form-control"
                    id="masterSKU"
                    value={masterSKUData.masterSKU}
                    onChange={(e) =>
                      setMasterSKUData({
                        ...masterSKUData,
                        masterSKU: e.target.value,
                      })
                    }
                    placeholder="Master SKU"
                  />

                  <label htmlFor="price">Price</label>
                  <input
                    type="number"
                    className="form-control"
                    id="price"
                    value={masterSKUData.price}
                    onChange={(e) => {
                      const priceValue = e.target.value;
                      if (
                        (!isNaN(priceValue) && priceValue > 0) ||
                        e.target.value === ""
                      ) {
                        setMasterSKUData({
                          ...masterSKUData,
                          price: priceValue,
                        });
                      }
                    }}
                    placeholder="Price"
                  />
                </div>
              </div>
              <button type="submit" className="sub-button02 mt-3">
                Save
              </button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {editProduct && (
        <Dialog
          open={open3}
          onClose={() => {
            setOpen3(false);
            setEditProduct(null);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{""}</DialogTitle>
          <DialogContent>
            <form className="mt-5" onSubmit={updateProduct}>
              <div className="row">
                <h4 className="head01 mb-4">Update Product</h4>
                <div className="col-sm-12">
                  <div className="form-group">
                    <label htmlFor="masterSku">Master SKU</label>

                    <Select
                      options={masterSKUs}
                      value={{
                        label: editProduct.masterSKU.masterSKU,
                        value: editProduct.masterSKU.masterSKU,
                      }}
                      onChange={(selected) => {
                        if (selected) {
                          const selectedValue = selected.value;
                          const selectedPrice = allMasterSKU.find(
                            (sku) => sku.masterSKU === selectedValue
                          )?.price;

                          setEditProduct((prevEditProduct) => ({
                            ...prevEditProduct,
                            masterSKU: {
                              masterSKU: selectedValue,
                              price: selectedPrice,
                            },
                          }));
                        } else {
                          // Handle clearing the selection if needed
                          setEditProduct((prevEditProduct) => ({
                            ...prevEditProduct,
                            masterSKU: null, // or whatever default value you prefer
                          }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="col-sm-12">
                  <div className="form-group">
                    <label htmlFor="productName">Product Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="productName"
                      name="productName"
                      placeholder="Product Name"
                      value={editProduct.productName}
                      onChange={(e) =>
                        setEditProduct((prevEditProduct) => ({
                          ...prevEditProduct,
                          productName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-12">
                  <div className="form-group">
                    <label htmlFor="productSKU">Product SKU</label>
                    <input
                      type="text"
                      className="form-control"
                      id="productSKU"
                      name="productSKU"
                      placeholder="Product SKU"
                      value={editProduct.productSKU}
                      onChange={(e) =>
                        setEditProduct((prevEditProduct) => ({
                          ...prevEditProduct,
                          productSKU: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-12">
                  <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      name="price"
                      placeholder="Price"
                      value={editProduct.masterSKU.price}
                      required
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-12">
                  <div className="form-group">
                    <label htmlFor="picture">Upload Image</label>
                    <input
                      type="file"
                      className="form-control-file"
                      id="picture"
                      name="picture"
                      // value={editProduct.picture}
                      onChange={handleFileChange1}
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="sub-button02 mt-3">
                Update
              </button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {editMasterSKU && (
        <Dialog
          open={open4}
          onClose={() => {
            setOpen4(false);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{""}</DialogTitle>
          <DialogContent>
            <form className="mt-5" onSubmit={updateMasterSKU}>
              <div className="row">
                <h4 className="head01 mb-4">Update Master SKU</h4>
                <div className="form-group">
                  <label htmlFor="masterSKU">Master SKU</label>
                  <input
                    type="text"
                    className="form-control"
                    id="masterSKU"
                    value={editMasterSKU.masterSKU}
                    placeholder="Master SKU"
                    onChange={(e) => {
                      const masterSKUValue = e.target.value;
                      setEditMasterSKU({
                        ...editMasterSKU,
                        masterSKU: masterSKUValue,
                      });
                    }}
                  />

                  <label htmlFor="price">Price</label>
                  <input
                    type="number"
                    className="form-control"
                    id="price"
                    value={editMasterSKU.price}
                    onChange={(e) => {
                      const priceValue = e.target.value;
                      if (
                        (!isNaN(priceValue) && priceValue > 0) ||
                        e.target.value === ""
                      ) {
                        setEditMasterSKU({
                          ...editMasterSKU,
                          price: priceValue,
                        });
                      }
                    }}
                    placeholder="Price"
                  />
                </div>
              </div>
              <button type="submit" className="sub-button02 mt-3">
                Update
              </button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Snackbar
        open={snackOpen}
        autoHideDuration={6000}
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
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loaderOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog open={bulkUploadOpen} onClose={() => setBulkUploadOpen(false)}>
        <DialogTitle>Bulk Upload Products</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={(e) => setBulkFile(e.target.files[0])}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleBulkUpload}
            disabled={!bulkFile}
            style={{ marginTop: "10px" }}
          >
            Upload
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={bulkMaterSkuUploadOpen}
        onClose={() => setBulkMaterSkuUploadOpen(false)}
      >
        <DialogTitle>Bulk Upload masterSku</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={(e) => setBulkMaterSkuFile(e.target.files[0])}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleBulkUploadMasterSku}
            disabled={!bulkMaterSkuFile}
            style={{ marginTop: "10px" }}
          >
            Upload
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
