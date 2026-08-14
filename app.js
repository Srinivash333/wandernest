const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");

const MONG_URL = "mongodb://127.0.0.1:27017/wandernest";


app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

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



// new route 

app.get("/listings/new",(req,res)=>{
    res.render("listings/new");
})




// show route  reading a single listing

app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show",{listing});
});


//create route 

app.post("/listings", async (req, res,next) => {
    //console.log(req.body);          // Print the entire request body
    //console.log(req.body.listing);  // Print the listing object

   try{
     const newListing = new Listing(req.body.listing);
    await newListing.save();

    res.redirect("/listings");
   }
   catch(err){
    next(err);
   }
});


// Edit route
app.get("/listings/:id/edit",async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit",{listing});
});


//Update Route
app.put("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let listing=req.body.listing;
    await Listing.findByIdAndUpdate(id,listing);
    res.redirect(`/listings/${id}`);
});


//Delete Route
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
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


app.use((err,req,res,next)=>{
    res.send("Something went wrong");
});




app.listen(8080,()=>{
    console.log("Server is running on port 8080");
});
