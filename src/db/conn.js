const mongoose = require("mongoose");

//This is how we can create data base and establish connection with it.
mongoose.connect(process.env.DATABASE_CONN_LINK).then(()=>{
  console.log('Connection Successful');
}).catch((e)=>{
  console.log(e,"no connection");
});
