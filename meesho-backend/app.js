require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const products = require("./routes/products");
const clients = require("./routes/clients");
const orders = require("./routes/orders");
const users = require("./routes/users");
const transactions = require("./routes/transactions");
const connectDB = require("./db/connect");
const User = require("./models/user");
// const notFound = require("./middleware/not-found");
// const errorHandlerMiddleware = require("./middleware/error-handler");
// variables
app.set("superSecret", process.env.SECRET);

// middleware
// app.use(express.static("./public"));
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use('/S4S-Templates', express.static('S4S-Templates'));
app.use(express.json());




// routes
app.use("/api/v1/products", products);
app.use("/api/v1/clients", clients);
app.use("/api/v1/orders", orders);
app.use("/api/v1/users", users);
app.use("/api/v1/transactions", transactions);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// app.use(notFound);
// app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5001;

const init = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );

    await createOrUpdateAdmin({
      email: "admin@gmail.com",
      password: "1234",
      userType: "admin",
      name: "Admin Kumar",
      phone: "8778450325",
      client:null,
    });
  } catch (error) {
    console.log("Error initializing:", error);
  }
};

const createOrUpdateAdmin = async (userData) => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ userType: "admin" });
    console.log(existingAdmin);

    if (existingAdmin) {
      // Update existing admin user
      await User.updateOne({ userType: "admin" }, userData);
      console.log("Admin user updated successfully");
    } else {
      // Create a new admin user
      const newAdmin = new User(userData);
      await newAdmin.save();
      console.log("Admin user created successfully");
    }
  } catch (error) {
    console.log("Error creating or updating admin:", error);
  }
};

init();


