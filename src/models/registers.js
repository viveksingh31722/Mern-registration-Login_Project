const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({

  firstname:{
    type:String,
    required: true
  },
  lastname:{
    type:String,
    required: true
  },
  email:{
    type:String,
    required: true,
    unique:true
  },
  gender:{
    type:String,
    required: true
  },
  phone:{
    type:Number,
    required: true,
    unique:true
  },
  age:{
    type:Number,
    required: true
  },
  password:{
    type:String,
    required: true
  },
  confirmpassword:{
    type:String,
    required: true
  },
  tokens:[{
    token:{
      type:String,
      required: true
    }
  }]

});

// Methods are used by the "instances", and use.statics is used for actual modal.
//Generation tokens.
employeeSchema.methods.generateAuthToken = async function(){
  try {
    const token = await jwt.sign({_id : this._id.toString()}, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({token : token}); // If the both the key and value are same we can simply write "token" also.
    await this.save();
    console.log(token);
    return token;
    
  } catch (error) {
    res.send("some error" + error);
    console.log("some error" + error);
  }
}

// So to bcrypt the password, we have to use a middleware used in modals, to put the check before storing the data int database. it name is (SchemaName followed by ".Pre"). As used below.

// Converting password into hash.
employeeSchema.pre("save", async function(next){

  if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmpassword = await bcrypt.hash(this.password, 10);
  };
  next();
});

const Register = new mongoose.model("Register", employeeSchema);

module.exports = Register;