const express = require("express");
const app = express();
const authRoutes = require("./routes/AuthRoute");
const connectDB = require("./config/Db");
const dotenv = require("dotenv");
const createCamp = require("./routes/CreateCamp");
const cors = require("cors");
const profileRoutes = require("./routes/ProfileRoute");
const postRoutes = require("./routes/PostRoute");
const paymentRoutes = require("./routes/PaymentRoute");
dotenv.config();
connectDB();

app.use(express.json());
app.use(cors());
app.use("/auth", authRoutes);
app.use("/campaign", createCamp);
app.use("/protected", profileRoutes);
app.use("/posts", postRoutes);
app.use("/payments", paymentRoutes);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});


