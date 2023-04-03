import express from "express";
const app = express();
import path from "path"
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt" 


//database connect to nodejs and mongodb
mongoose.connect("mongodb://127.0.0.1:27017", {
  dbname: "backend",

})
  .then(() => console.log("Database connected"))
  .catch((e) => console.log(e));
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", userSchema)


//const users =[]; hum user array me data save nahi karvana hai ye sirf example ke liye hai

// for static folder public serve
// using middle ware

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//to set engine
app.set("view engine", "ejs");

app.get("/add", async (req, res) => {

  await Message.create({ name: "Mamraj2", email: "sample2@gmail.com" })
  res.send("Nice");
});



const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "dwesasfsdwqqdwqdw");// token decode ho raha hai yaha se id milegi user ki
    req.user = await User.findById(decoded._id)// id se user ko duda ja raha hai
    next();

  }
  else {
    res.redirect("/login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");// first time register ke liye

});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) return res.redirect("/register");

  const isMatch = await bcrypt.compare(password,user.password);// bcrypt password ko match karne ke liye

  if (!isMatch) return res.render("login", { email, message: "Incorrect password" });

  const token = jwt.sign({ _id: user._id }, "dwesasfsdwqqdwqdw");// jwt parser method token create hoga is token ko decode kar sakte hai




  res.cookie("token", token, {
    httpOnly: true, expires: new Date(Date.now() + 60 * 1000),

  });
  res.redirect("/");
});


app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;


  const users = await User.findOne({ email })// user ko find karna uski email se
  if (users) {
    return res.redirect("/login");

  }

  const hashedpassword = await bcrypt.hash(password,10);// password bcrypt karne ke liye hai




  const user = await User.create({// await user.creste se detabase me id store ho rahi hai

    name,
    email,
    password: hashedpassword,
  });

  const token = jwt.sign({ _id: user._id }, "dwesasfsdwqqdwqdw");// jwt parser method token create hoga is token ko decode kar sakte hai




  res.cookie("token", token, {
    httpOnly: true, expires: new Date(Date.now() + 60 * 1000),

  });
  res.redirect("/");

});

app.get("/logout", (req, res) => {
  res.cookie("token", "null", {
    httpOnly: true,
    expires: new Date(Date.now()),

  });
  res.redirect("/");

});

app.listen(5000, () => {
  console.log("server is working");

});

