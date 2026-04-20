import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINT } from "../util";
import ReactConfetti from "react-confetti";
import useWindowSize from "../hooks/useWindowSize";

const CreateOrder = () => {
  const navigate = useNavigate();
  const [productsList, setProductsList] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [ownLabel, setOwnLabel] = useState(null);
  const [shippingCharge, setShippingCharge] = useState(0);

  const [open, setOpen] = React.useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [marketPlace, setMarketPlace] = useState(""); // Default to empty
  const [productSKUs, setProductSKU] = useState([]);
  const [isExploading, setIsExploading] = useState(false);
  const { width, height } = useWindowSize;
  const [products, setProducts] = useState([
    {
      marketplaceOrderNumber: "",
      productSKU: "",
      quantity: "",
      productName: "",
      price: "",
      _id: "",
      masterSKU: "",
    },
  ]);
  const [selectedMasterSKU, setSelectedMasterSKU] = useState(null);
  const [open2, setOpen2] = React.useState(false);
  const [snack, setSnack] = React.useState("");
  const [snackType, setSnackType] = React.useState("success");
  const [label, setLabel] = useState("");
  const handleClick2 = () => {
    setOpen2(true);
  };

  const handleClose2 = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen2(false);
  };

  const [open3, setOpen3] = React.useState(false);
  const handleClose3 = () => {
    setOpen3(false);
  };
  const handleOpen3 = () => {
    setOpen3(true);
  };

  const fetchClientData = async () => {
    try {
      const token = localStorage.getItem("token");
      const clientId = localStorage.getItem("clientId");

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/clients/${clientId}`, // Fetch client data using the provided endpoint
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch client data");
      }

      const data = await response.json();

      setWalletBalance(data.data.walletBalance); // Set the wallet balance
    } catch (error) {
      console.error(error);
      // Handle error if needed
    }
  };

  const [bulkOrderFile, setBulkOrderFile] = useState(null);

  const handleBulkOrderFileChange = (event) => {
    setBulkOrderFile(event.target.files[0]);
  };

  const handleBulkOrderSubmit = async () => {
    try {
      handleOpen3();
      const token = localStorage.getItem("token");
      const clientId = localStorage.getItem("clientId");

      if (!bulkOrderFile) {
        alert("Please select a file to upload.");
        return;
      }

      const formData = new FormData();
      formData.append("clientId", clientId);
      formData.append("marketPlace", marketPlace);
      formData.append("bulkOrder", bulkOrderFile);

      const requestOptions = {
        method: "POST",
        headers: {
          "x-access-token": token,
        },
        body: formData,
      };

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/orders/uploadBulkOrder`,
        requestOptions
      );
      const data = await response.json();
      if (data.success) {
        setOpen(true);
        setSnack(data.message);
        setSnackType("success");
        handleClick2();
        // make sure after successfull upload the file is cleared
        setBulkOrderFile(null);
        setIsExploading(true);
        fetchClientData();
        handleClose3();
      } else {
        setSnack(data.message);
        setSnackType("error");
        handleClick2();
        handleClose3();
      }

      // Handle successful response here
    } catch (error) {
      console.error(error);
      setSnack("Something went wrong!");
      setSnackType("error");
      handleClick2();
      handleClose3();
      // Handle error
    }
  };

  const handleClose = () => {
    setOpen(false);
    setIsExploading(false);
    setProducts([
      {
        marketplaceOrderNumber: "",
        productSKU: "",
        quantity: "",
        productName: "",
        price: "",
        _id: "",
        masterSKU: "",
      },
    ]);
  };

  const handleAddMoreClick = () => {
    // Check if all details are filled in all previous products
    const allDetailsFilled = products.every((product) =>
      Object.values(product).every((value) => value !== "")
    );

    // Only add a new product if all details are filled in all previous products
    if (allDetailsFilled) {
      setProducts([
        ...products,
        {
          _id: "",
          marketplaceOrderNumber: "",
          productSKU: "",
          quantity: "",
          productName: "",
          price: "",
          masterSKU: "",
        },
      ]);
    } else {
      // Optionally, you can provide feedback to the user if details are missing
      alert("Please fill in all details in previous products.");
    }
  };

  const handleRemoveOrderClick = (index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const handleAddMoneyClick = () => {
    navigate("/addmoney");
  };

  useEffect(() => {
    fetchProducts(); // Fetch products when the component mounts
    fetchClientData(); // Fetch client data when the component mounts
  }, []);

  useEffect(() => {
    if (marketPlace !== "Meesho") {
      fetchShippingMethods();
    } else {
      setShippingMethods([]);
      setSelectedShippingMethod(null);
      setShippingCharge(0);
    }
  }, [marketPlace]);

  const fetchShippingMethods = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_ENDPOINT}/api/v1/shipping-methods`, {
        headers: { "x-access-token": token },
      });
      setShippingMethods(res.data.data);
    } catch (err) {
      setShippingMethods([]);
    }
  };

  const fetchProducts = async () => {
    try {
      // Make the API call to fetch all products
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/products/selected/all`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token"),
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      // Extract product SKUs from the data and set the state

      setProductsList(data.data);
      // make here an array of productSku in format of label and value and set same value in both case
      setProductSKU(
        data.data.map((product) => ({
          label: product.productSKU,
          value: product.productSKU,
        }))
      );
    } catch (error) {
      console.error(error);
      // Handle error if needed
    }
  };

  // const placeOrder = async () => {
  //   handleOpen3();
  //   try {
  //     const token = localStorage.getItem("token");
  //     const clientId = localStorage.getItem("clientId");
  //     let walletBalance = 0;
  //     let totalPrice = 0;

  //     const allProductsFilled = products.every(
  //       (product) =>
  //         product.marketplaceOrderNumber &&
  //         product.productSKU &&
  //         product.quantity &&
  //         product.productName &&
  //         product.price &&
  //         product.labelFile
  //     );

  //     if (!allProductsFilled) {
  //       handleClose3();
  //       alert(
  //         "Please fill in all details for all products before placing the order."
  //       );
  //       return; // Exit the function if any product is incomplete
  //     }

  //     const response = await fetch(
  //       `${API_ENDPOINT}/api/v1/clients/${clientId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "x-access-token": token,
  //         },
  //       }
  //     );

  //     const data = await response.json();
  //     if (data.success) {
  //       walletBalance = data.data.walletBalance;
  //     } else {
  //       handleClose3();
  //       return;
  //     }

  //     products.forEach((product) => {
  //       totalPrice += product.price * product.quantity + 4;
  //     });

  //     if (totalPrice > walletBalance) {
  //       setSnack("Insufficient funds. Please add money to your wallet.");
  //       setSnackType("error");
  //       handleClick2();
  //       handleClose3();
  //       return;
  //     }

  //     for (const product of products) {
  //       const formData = new FormData();
  //       formData.append("marketPlace", marketPlace);
  //       formData.append("clientId", clientId);
  //       formData.append(
  //         "marketplaceOrderNumber",
  //         product.marketplaceOrderNumber
  //       );
  //       formData.append("productId", product._id);
  //       formData.append("productPrice", product.price);
  //       formData.append("quantity", product.quantity);
  //       formData.append("status", "Order Placed");
  //       formData.append("packingCharge", 4);
  //       formData.append("totalPrice", product.price * product.quantity + 4);

  //       if (product.labelFile) {
  //         formData.append("label", product.labelFile);
  //       }

  //       const requestOptions = {
  //         method: "POST",
  //         headers: {
  //           "x-access-token": token,
  //         },
  //         body: formData,
  //       };

  //       const response = await fetch(
  //         `${API_ENDPOINT}/api/v1/orders/add`,
  //         requestOptions
  //       );

  //       const data = await response.json();

  //       if (data.success) {
  //         setOpen(true);
  //         setSnack(data.message);
  //         setSnackType("success");
  //         handleClick2();
  //         fetchClientData();
  //         setProducts([
  //           {
  //             marketplaceOrderNumber: "",
  //             productSKU: "",
  //             quantity: "",
  //             productName: "",
  //             price: "",
  //             _id: "",
  //           },
  //         ]);
  //         setSelectedMasterSKU(null);
  //       } else {
  //         setSnack(data.message);
  //         setSnackType("error");
  //         handleClick2();
  //       }
  //     }
  //     handleClose3();
  //     setIsExploading(true);
  //   } catch (error) {
  //     console.error(error);
  //     // Handle error
  //   }
  // };

  const placeOrder = async () => {
    handleOpen3();
    try {
      const token = localStorage.getItem("token");
      const clientId = localStorage.getItem("clientId");
      let walletBalance = 0;
      let totalPrice = 0;

      const allProductsFilled = products.every(
        (product) =>
          product.marketplaceOrderNumber &&
          product.productSKU &&
          product.quantity &&
          product.productName &&
          product.price
      );

      if (!allProductsFilled || !label) {
        // check here for label as well
        handleClose3();
        alert(
          "Please fill in all details for all products before placing the order."
        );
        return; // Exit the function if any product is incomplete
      }

      const response1 = await fetch(
        `${API_ENDPOINT}/api/v1/clients/${clientId}`,
        {
          method: "GET",
          headers: {
            "x-access-token": token,
          },
        }
      );

      const data1 = await response1.json();
      if (data1.success) {
        walletBalance = data1.data.walletBalance;
      } else {
        handleClose3();
        return;
      }


      for (const product of products) {
        totalPrice += product.price * product.quantity + 4;
      }
      // Add shipping charge if not Meesho
      if (marketPlace !== "Meesho" && shippingCharge) {
        totalPrice += Number(shippingCharge);
      }

      if (totalPrice > walletBalance) {
        setSnack("Insufficient funds. Please add money to your wallet.");
        setSnackType("error");
        handleClick2();
        handleClose3();
        return;
      }

      const formData = new FormData();

      // Add product data

      formData.append("products", JSON.stringify(products));
      formData.append("marketPlace", marketPlace);
      formData.append("clientId", clientId);
      // Attach label only if required by selected shipping method
      let selectedMethodObj = shippingMethods.find(m => m._id === selectedShippingMethod);
      if (marketPlace !== "Meesho" && selectedMethodObj && selectedMethodObj._id === "69e60bc22e8678f757162c5f") {
        formData.append("label", ownLabel);
      } else {
        formData.append("label", label);
      }
      if (marketPlace !== "Meesho") {
        formData.append("shippingMethod", selectedShippingMethod);
        formData.append("shippingCharge", shippingCharge);
      }

      const requestOptions = {
        method: "POST",
        headers: {
          "x-access-token": token,
        },
        body: formData,
      };

      const response = await fetch(
        `${API_ENDPOINT}/api/v1/orders/add`,
        requestOptions
      );

      const data = await response.json();

      if (data.success) {
        setOpen(true);
        setSnack(data.message);
        setSnackType("success");
        handleClick2();
        fetchClientData();
        setProducts([
          {
            marketplaceOrderNumber: "",
            productSKU: "",
            quantity: "",
            productName: "",
            price: "",
            _id: "",
            masterSKU: "",
          },
        ]);
        setSelectedMasterSKU(null);
        setIsExploading(true);
      } else {
        setSnack(data.message);
        setSnackType("error");
        handleClick2();
      }

      handleClose3();
    } catch (error) {
      console.error(error);
      // Handle error
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  // const handleProductChange = (index, value) => {
  //   if (value !== null) {
  //     const selectedProduct = productsList.find(
  //       (product) => product.productSKU === value.value
  //     );
  //     if (selectedProduct) {
  //       const updatedProducts = [...products];
  //       updatedProducts[index].productName = selectedProduct.productName;
  //       updatedProducts[index].price = selectedProduct.masterSKU.price;
  //       updatedProducts[index]._id = selectedProduct._id;
  //       setProducts(updatedProducts);
  //     }
  //   } else {
  //     const updatedProducts = [...products];
  //     updatedProducts[index].productName = "";
  //     updatedProducts[index].price = "";
  //     updatedProducts[index]._id = "";
  //     setProducts(updatedProducts);
  //   }
  // };

  const handleProductChange = (index, selected) => {
    if (selected !== null) {
      const selectedProduct = productsList.find(
        (product) => product.productSKU === selected.value
      );
      if (selectedProduct) {
        const updatedProducts = [...products];
        updatedProducts[index].productName = selectedProduct.productName;
        updatedProducts[index].price = selectedProduct.masterSKU.price;
        updatedProducts[index]._id = selectedProduct._id;
        updatedProducts[index].productSKU = selected.value;
        updatedProducts[index].masterSKU = selectedProduct.masterSKU._id; // Update productSKU
        setProducts(updatedProducts);
      }
    } else {
      const updatedProducts = [...products];
      updatedProducts[index].productName = "";
      updatedProducts[index].price = "";
      updatedProducts[index]._id = "";
      updatedProducts[index].productSKU = ""; // Clear productSKU
      updatedProducts[index].masterSKU = "";
      setProducts(updatedProducts);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLabel(file);
    }
  };

  return (
    <>
      <div id="main-content">
        <div className="container-fluid">
          <div className="card">
            <div className="header">
              <h4 className="head01 mt-3 mb-4">
                Wallet Balence: ₹{walletBalance}
              </h4>
              <button className="add-money" onClick={handleAddMoneyClick}>
                <i className="fa-solid fa-plus pr-2"></i>Add Money
              </button>


              <div className="row mt-3">
                <div className="col-sm-12">
                  <div className="d-flex flex-row flex-wrap mt-3">
                    <div className="form-group">
                      <label htmlFor="exampleFormControlSelect1">Marketplace</label>
                      <select
                        className="form-control"
                        id="exampleFormControlSelect1"
                        value={marketPlace}
                        onChange={(e) => {
                          setMarketPlace(e.target.value);
                          setSelectedShippingMethod("");
                        }}
                      >
                        <option value="">Select your marketplace</option>
                        <option>Meesho</option>
                        <option>Amazon</option>
                        <option>Flipkart</option>
                        <option>Snapdeal</option>
                        <option>Glowroad</option>
                        <option>Shopify</option>
                        <option>Others</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6"></div>
              </div>

              {products.map((product, index) => (
                <div className="row mt-4" key={index}>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label for="exampleFormControlInput1" className="amount">
                        Marketplace Order Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput1"
                        placeholder="Enter Marketplace Order Number"
                        value={product.marketplaceOrderNumber}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "marketplaceOrderNumber",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label for="exampleFormControlSelect2">Product SKU</label>

                      <Select
                        options={productSKUs}
                        isClearable
                        value={
                          products[index].productSKU
                            ? {
                              label: products[index].productSKU,
                              value: products[index].productSKU,
                            }
                            : null
                        }
                        onChange={(selected) =>
                          handleProductChange(index, selected)
                        }
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label for="exampleFormControlInput1" className="amount">
                        Quantity
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="exampleFormControlInput1"
                        value={product.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (
                            (!isNaN(value) && value > 0) ||
                            e.target.value === ""
                          ) {
                            handleInputChange(index, "quantity", value);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label for="exampleFormControlInput01" className="amount">
                        Product Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput01"
                        value={product.productName}
                        readOnly
                      />
                    </div>
                  </div>


                  <div className="col-sm-6">
                    <div className="form-group">
                      <label
                        htmlFor="exampleFormControlInput001"
                        className="amount"
                      >
                        Price
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput001"
                        value={product.price}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Shipping method and label upload after price */}
                  {marketPlace && marketPlace !== "Meesho" && (
                    <>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label htmlFor="shippingMethodSelect">Shipping Method</label>
                          <select
                            className="form-control"
                            id="shippingMethodSelect"
                            value={selectedShippingMethod || ""}
                            onChange={e => {
                              setSelectedShippingMethod(e.target.value);
                              const method = shippingMethods.find(m => m._id === e.target.value);
                              setShippingCharge(method ? method.charge : 0);
                            }}
                          >
                            <option value="">Select Shipping Method</option>
                            {shippingMethods.map((m) => (
                              <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* Only show label upload if selected shipping method is the one with id 69e60bc22e8678f757162c5f */}
                      {(() => {
                        const selectedMethod = shippingMethods.find(m => m._id === selectedShippingMethod);
                        return selectedMethod && selectedMethod._id === "69e60bc22e8678f757162c5f";
                      })() && (
                          <div className="col-sm-6">
                            <div className="form-group">
                              <label>Upload Label (PDF)</label>
                              <input
                                type="file"
                                accept=".pdf"
                                className="form-control"
                                onChange={e => setOwnLabel(e.target.files[0])}
                              />
                            </div>
                          </div>
                        )}
                      {shippingCharge > 0 && (
                        <div className="col-sm-6">
                          <div className="form-group mt-2">
                            <strong>Shipping Charge: ₹{shippingCharge}</strong>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div
                    className="col-sm-6"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "14px",
                    }}
                  >
                    {products.length > 1 && (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRemoveOrderClick(index)}
                        style={{
                          borderRadius: "10px",
                          marginTop: "0px",
                        }}
                      >
                        Remove Order
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleAddMoreClick}
                  style={{
                    borderRadius: "10px",
                    marginTop: "0px",
                  }}
                >
                  Add More
                </Button>

                <Button
                  variant="contained"
                  color="info"
                  component="label"
                  style={{
                    borderRadius: "10px",
                    marginTop: "0px",
                  }}
                >
                  Upload Label
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e)} // Pass index to identify the corresponding product
                    accept=".pdf"
                  />
                </Button>

                {label && <p style={{ marginLeft: "10px" }}>{label.name}</p>}
              </div>
              <br />

              <div className="d-flex flex-row justify-content-center mt-5 ">
                <button className="placeo" onClick={placeOrder}>
                  Place order
                </button>
              </div>

              <div className="d-flex flex-row justify-content-center">
                <h4 className="or">OR</h4>
              </div>

              <h4 className="head01 mt-3 mb-4">Create Bulk Order</h4>

              <form>
                <div className="form-group">
                  <label htmlFor="bulkOrderFileInput" className="amount">
                    Upload Orders in Bulk
                  </label>
                  <input
                    type="file"
                    className="form-control-file"
                    id="bulkOrderFileInput"
                    onChange={handleBulkOrderFileChange}
                    accept=".xlsx, .xls"
                  />
                </div>
              </form>
              <button className="placeo1" onClick={handleBulkOrderSubmit}>
                Submit
              </button>

              <a
                href={`${API_ENDPOINT}/S4S-Templates/bulk_order_template.xlsx`}
                download={true}
              >
                <h6>Download Template</h6>
              </a>
            </div>
          </div>
        </div>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Order Successfully Created
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Your order has been successfully created.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="success" variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={open2} autoHideDuration={10000} onClose={handleClose2}>
          <Alert
            onClose={handleClose2}
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
      {isExploading && (
        <ReactConfetti
          width={width}
          height={height}
          numberOfPieces={600}
          tweenDuration={10000}
        />
      )}
    </>
  );
};

export default CreateOrder;
