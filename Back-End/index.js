// Require the NPM packages that we need
const express = require("express");
const app = express();
require("dotenv").config(); // access environment variables
const db = require("./config/database"); // Connect to Database
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const APIError = require("./utils/APIError");
const globalError = require("./middlewares/errorMiddleware");
// Import Routes
const authRouters = require("./router/auth");
const userRouters = require("./router/user");
const categoryRouters = require("./router/category");
const productRouters = require("./router/products");

// Middleware
// This allows us to pass data from the form
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//Parse Cookie header
app.use(cookieParser());

// Routes Middlware
app.use("/api", authRouters);
app.use("/api", userRouters);
app.use("/api/category", categoryRouters);
app.use("/api/product", productRouters);

// Handle Unhandled Routes
app.all("*", (req, res, next) => {
  // create error and send it to errors handling middlware
  // const err = new Error(`Can't find this route ${req.originalUrl}`);
  // next(err.message); // send it to Global handling middlware
  next(new APIError(`Can't find this route ${req.originalUrl}`, 400)); // send it to Global handling middlware
});

// Global handling middlware
app.use(globalError);

// Handle rejection outside express
// process.on("unhandledRejection", (err) => {
//   console.error(`unhandledRejection Errors ${err}`);
// });

const PORT = process.env.PORT || 3000; // // Set a default environment port or cutom port - 3000

// Start out application
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
