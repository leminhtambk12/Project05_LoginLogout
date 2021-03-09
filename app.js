const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const passport = require("passport");
//Initialize the app
const app = express();
//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
//Set up static directory
app.use(express.static(path.join(__dirname, "public")));
//Use passport middleware
app.use(passport.initialize());
//Bring in passport Strategy
require("./config/passport")(passport);
//Bring in the Database config
const db = require("./config/keys").mongoURI;
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log(`server connected successfully ${db}`);
    })
    .catch((err) => console.log(`Unable to connect database ${err}`));
//Routes
const users = require("./routes/api/users");
app.use("/api/users", users);
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});
//PORT and listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sever started on port ${PORT}`));