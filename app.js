const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");

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
app.get("/listings", wrapAsync(async (req, res) => {

    // Fetch all data from DB
    const allListings = await Listing.find({});

    // Render index.ejs and send data
    res.render("listings/index", { allListings });
}));



// new route 

app.get("/listings/new",(req,res)=>{
    res.render("listings/new");
})




// show route  reading a single listing

app.get("/listings/:id", wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show",{listing});
}));


//create route 

app.post("/listings", wrapAsync(async (req, res, next) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Invalid Listing Data");
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();

    res.redirect("/listings");
}));


// Edit route
app.get("/listings/:id/edit", wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit",{listing});
}));


//Update Route
app.put("/listings/:id", wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Invalid Listing Data");
    }
    let {id}=req.params;
    let listing=req.body.listing;
    await Listing.findByIdAndUpdate(id,listing);
    res.redirect(`/listings/${id}`);
}));


//Delete Route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));


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


app.all("/*splat", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).send(message);
});




app.listen(8080,()=>{
    console.log("Server is running on port 8080");
});
