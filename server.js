const express = require("express");
const router = require("./routes/user-routes");
const mongoose =  require("mongoose")
const cookieParser = require('cookie-parser')

const app = express();
app.use(cookieParser())
// Connect to MongoDB
mongoose.connect("mongodb+srv://favdevs:Fav1234@cluster0.biy2mm1.mongodb.net/04-STORE-API?retryWrites=true&w=majority", {useNewUrlParser: true,
useUnifiedTopology: true})

// Initialize middleware
app.use(express.json());


// Routes
app.use("/api/user", router);


  app.use(express.static("investors/build"));

  
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));
