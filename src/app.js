require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const auth = require("./middleware/auth");



const { register } = require("module");
require("./db/conn");
const Register = require("./models/registers");

//This is use to provide specified port no. to website while hosting.
const port = process.env.PORT || 3000;


//This is how we can get the path of the static website.
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");


app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());

//This is the middleware to run the static website.
app.use(express.static(static_path));
// This is used to setup the view engine.
app.set("view engine", "hbs");
//This middleware use to show the path of views folder to express.
app.set("views", template_path);
//Registering the partials so that, express will recongnise them. 
hbs.registerPartials(partials_path);



app.get("/", (req, res) =>{
  res.render("index");
});

app.get("/secret", auth , (req, res) =>{
  // console.log(`This is cookie ${req.cookies.jwt}`);
  res.render("secret");
});

app.get("/logout", auth, async(req, res) =>{
  try {
    console.log(req.user);

    //This is the way we can delete the current token form tokens object and delete it from db to logout user.
    // For single device logout.
    // req.user.tokens = req.user.tokens.filter((currElement) =>{
    //   return currElement.token !== req.token;
    // })

    //Logout from all devices.
    req.user.tokens = [];

    //This one is simply clearing the cookie to logout the user.
    res.clearCookie("jwt");

    console.log('Logout Successfully');
    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/register", (req, res) =>{
  res.render("register")
});

app.get("/login", (req, res) =>{
  res.render('login')
});


app.post("/register", async (req, res) =>{
  try {
    
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;

    if(password == cpassword){

      const registerEmployee = new Register({

        //The first values before colon is from Schema, and the second values form html name attribute.
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        phone:req.body.phonenumber,
        gender:req.body.gender,
        age:req.body.age,
        password:password,
        confirmpassword:cpassword
      });


      console.log('The success part' + registerEmployee);
      

      //Adding middleware for generation Jwt token.
      const token = await registerEmployee.generateAuthToken();

      //The res.cookie() function is used to set the cookie name to value.
      //The value parameter is may be a string or object converted to json.
      // The below code is for adding the jwt token value to the cookie

      // res.cookie("jwt", token,{
      //   expires: new Date(Date.now() + 3600000),
      //   httpOnly:true
      // });
      // console.log(cookie);
      

      //In between we are using a middleware to bcrypt the password before saving the data in database.
      // That middleware is present in register.js file, where schema has defined with the name of ("SchemaName.pre")
      const registered = await registerEmployee.save();
      res.status(200).render("login");
    }else{
      res.send("Passwords are not matching");
    }
  } catch (e) {
    res.status(400).send(e);
    console.log('the error part page');
    
  }
});


app.post("/login", async (req, res) =>{
  try {

    const email = req.body.email;
    const password = req.body.password;

    const useremail= await Register.findOne({email:email});
    const isMatch = bcrypt.compare(password, useremail.password);

    //This is for generating jsonwebtoken.
    const token = await useremail.generateAuthToken();
    console.log('The token part' + token);

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 60000),
      httpOnly:true
    });
    

    if(isMatch){

      res.status(201).render("index");

    }else{

      res.send("Invalid login details");
    }
    // console.log(`${email} and password is ${password}`);

    //The below code for verifying the user token.

  } catch (e) {
    res.status(400).send("invalid valid login details");
  }
});



// const bcrypt = require("bcryptjs");

// const securePassword = async (password) =>{
  
//   const hashedPassword = await bcrypt.hash(password, 12);
//   console.log(hashedPassword);

//   const passwordMatch = await bcrypt.compare(password, hashedPassword);
//   console.log(passwordMatch);
  
// }

// securePassword("Singhvivek321@");


// const jwt = require("jsonwebtoken");

// const createToken = async () =>{
//   const token = await jwt.sign({_id: "677f975f2490f513120eab9b"}, "fsdfsfsfsfefiuiishisdfhigisfihsifsif",{
//     expiresIn:"2 seconds"
//   });
//   console.log(token);

//   const userVer = await jwt.verify(token, "fsdfsfsfsfefiuiishisdfhigisfihsifsif",);
//   console.log(userVer);
  
// }
// createToken()

app.listen(port, ()=>{
  console.log(`Server running at port no. ${port}`);
});