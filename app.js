const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");

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


const validateListing = (req, res, next) =>{
    let {error} = listingSchema.validate(req.body);
    if (error) {
        let msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    }
    else
    {
        next();
    }
};


const validateReview = (req, res, next) =>{
    let {error} = reviewSchema.validate(req.body);
    if (error) {
        let msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    }
    else
    {
        next();
    }
};

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
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show",{listing});
}));


//create route 

app.post("/listings",validateListing, wrapAsync(async (req, res, next) => {
  
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
app.put("/listings/:id",validateListing, wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let listing=req.body.listing;
    await Listing.findByIdAndUpdate(id,listing);
    res.redirect(`/listings/${id}`);
}));


//Delete Route
app.delete("/listings/:id", validateListing, wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));


//Review Route
//post route to create a new review for a listing
app.post("/listings/:id/reviews",validateReview, wrapAsync(async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);

    listing.reviews.push(newReview);    
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);


}));


//Delete route to delete a review for a listing
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
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

    res.status(statusCode).render("error.ejs", { err });
});




app.listen(8080,()=>{
    console.log("Server is running on port 8080");
});
