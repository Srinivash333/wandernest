const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js");
const path=require("path");

const MONG_URL = "mongodb://127.0.0.1:27017/wandernest";


app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));

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

// Route to show all listings
app.get("/listings", async (req, res) => {

    // Fetch all data from DB
    const allListings = await Listing.find({});

    // Render index.ejs and send data
    res.render("listings/index", { allListings });
});



// show route  reading a single listing

app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show",{listing});
});




// app.get("/testListing", async(req,res)=>{
//      let sampleListing=new Listing({
//          title:"My New Villa",
//          description:"By the beach",
//         price:1200,
//          location:"Goa",
//          country:"India",
//      });

//      await sampleListing.save();
//      console.log("sample was saved");
//     res.send("Successfull testing");
// });




app.listen(8080,()=>{
    console.log("Server is running on port 8080");
});
