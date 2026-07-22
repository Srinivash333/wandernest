const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js");

const MONG_URL = "mongodb://127.0.0.1:27017/wandernest";

async function main() {
    await mongoose.connect(MONG_URL);
}

// Call function
main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });


//Route 
app.get("/",(req,res)=>{
    res.send("Hello World");
});



app.get("/testListing", async(req,res)=>{
     let sampleListing=new Listing({
         title:"My New Villa",
         description:"By the beach",
        price:1200,
         location:"Goa",
         country:"India",
     });

     await sampleListing.save();
     console.log("sample was saved");
    res.send("Successfull testing");
});

app.listen(8080,()=>{
    console.log("Server is running on port 8080");
});
