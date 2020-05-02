const bodyParser        = require("body-parser");
const methodOverride    =require("method-override");
const expressSanitizer  = require("express-sanitizer");
const mongoose          = require("mongoose");
const express           = require("express");
const app               = express();


let url = process.env.DATABASEURL || "mongodb://localhost/blog_app"
console.log(url);
mongoose.connect(url,
{ 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, 
    useCreateIndex: true 
    
}).then(() => {
    console.log("db connected");
}).catch(err =>{
    console.log("error",err.message);
});

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressSanitizer());

app.use(methodOverride("_method"));




//MONGOOSE?MODEL CONFIG
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
});
const Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title:"Test",
//     image:"https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
//     body:"Hello"
// });

//RESTful Routes

app.get("/", async function(req, res) {
    res.redirect("/blogs");

});

//INDEX ROUTE
app.get("/blogs", async function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log("error");
        }
        else {
            res.render("index", { blogs: blogs });
        }
    });


});


app.get("/blogs/new",async function(req, res) {
    res.render("new");
});


//CREATE ROUTE
app.post("/blogs",async function(req, res) {
    //create blog
    
    Blog.create(req.body.blog, function(err, newBlog) {
        if (err) {
            res.render("new");
        }
        //redirect to index
        else {
            res.redirect("/blogs");
        }

    });

});






//SHOW ROUTE
app.get("/blogs/:id",async function(req, res) {
    
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("show",{blog: foundBlog});
        }
    });
  
});
//EDIT ROUTE
app.get("/blogs/:id/edit",async function(req, res) {
      
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("edit",{blog: foundBlog});
        }
    });
  
    
});

//UPDATE ROUTE

app.put("/blogs/:id",async function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/" +req.params.id);
        }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id",async function(req,res){
//destroy blog and redirect
Blog.findByIdAndRemove(req.params.id , function(err){
    
     if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/");
        }
    
});
});



app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Blog App Server Started");
});
