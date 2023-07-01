const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const router = require("./routes/user-routes");

const app = express();

// Connect to MongoDB
connectDB();

// Initialize middleware
app.use(express.json());
app.use(
  cors({
    origin: "https://climax.herokuapp.com/",
    // origin: "http://localhost:3000",
  })
);

// Routes
app.use("/api/user", router);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));
