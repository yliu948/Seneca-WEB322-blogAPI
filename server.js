/*********************************************************************************
 *  WEB322 – Assignment 06
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Yi Liu Student ID: 175187210 Date: 2022/11/10
 *
 *  Cyclic Web App URL: https://cobalt-blue-bluefish-cape.cyclic.app
 *
 *  GitHub Repository URL: https://github.com/yliu948/web322-app.git
 *
 ********************************************************************************/
//config

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require("path");
var blog = require("./blog-service.js");
var authData = require("./auth-service.js");
console.log("Express http server listening on " + HTTP_PORT);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
const clientSessions = require("client-sessions");

//setup cloud to store picture
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
cloudinary.config({
  cloud_name: "detgzmuqr",
  api_key: "737436397354262",
  api_secret: "uUNPAkfI89fw0P4l2rbrl_IOLbg",
  secure: true,
});
const upload = multer();

//client-sessions middleware
app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "password", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

// check if user is logged in
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

//access to session middleware
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

//removes unwanted JavaScript code
const stripJs = require("strip-js");

//set up handlebar & helpers

const exphbs = require("express-handlebars");
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      //render items and check if route is active
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },

      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlerbars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
    },
  })
);
app.set("view engine", ".hbs");

//middleware: activeRoute
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

//main page
app.get("/", (req, res) => {
  res.redirect("/about");
});

//about page
app.get("/about", (req, res) => {
  //res.sendFile(path.join(__dirname, "/views/about.html"));
  res.render("about");
});

//blog tag
app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blog.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blog.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blog.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

//user access through /blog/value
app.get("/blog/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blog.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blog.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    viewData.post = await blog.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blog.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

//posts tag
app.get("/posts", ensureLogin, (req, res) => {
  if (req.query.category) {
    //if user access through /posts?category=value
    blog
      .getPostsByCategory(req.query.category) // use req.query.*** to access query
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } else if (req.query.minDate) {
    //if user access through /posts?minDate=value
    blog
      .getPostsByMinDate(req.query.minDate)
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } else {
    // if user access through /posts
    blog
      .getAllPosts()
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }
});

// user access through /posts/value
app.get("/post/:id", ensureLogin, (req, res) => {
  blog
    .getPostById(req.params.id)
    .then((data) => {
      //res.json(data);
      res.render("post", { post: data });
    })
    .catch(() => {
      console.log("hit catch!");
      res.render("post", { message: "no results" });
    });
});

// add new post tag
app.get("/posts/add", ensureLogin, (req, res) => {
  //res.sendFile(path.join(__dirname, "/views/addPost.html"));
  blog
    .getCategories()
    .then((data) => {
      res.render("addPost", { categories: data });
    })
    .catch(() => {
      res.render("addPost", { categories: [] });
    });
});

// listen to add form
app.post(
  "/posts/add",
  ensureLogin,
  upload.single("featureImage"),
  (req, res) => {
    if (req.file) {
      let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          });

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
      }

      upload(req).then((uploaded) => {
        processPost(uploaded.url);
      });
    } else {
      processPost("");
    }

    // add user input into posts list
    function processPost(imageUrl) {
      req.body.featureImage = imageUrl;
      var formData = req.body; // data from a POST method form is stored in the req.body
      blog
        .addPost(formData)
        .then(() => {
          res.redirect("/posts");
        })
        .catch((err) => {
          console.log("Error11: " + err);
        });
    }
  }
);

//add new category
app.get("/categories/add", ensureLogin, (req, res) => {
  res.render("addCategory");
});

//listen to add category
app.post("/categories/add", ensureLogin, (req, res) => {
  // data from a POST method form is stored in the req.body
  blog
    .addCategory(req.body)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      console.log("Error: " + err);
    });
});

//delete category
app.get("/categories/delete/:id", ensureLogin, (req, res) => {
  blog
    .deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).render({
        message: "Unable to Remove Category / Category not found",
      });
    });
});

//delete post
app.get("/posts/delete/:id", ensureLogin, (req, res) => {
  blog
    .deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).render({
        message: "Unable to Remove Post / Post not found",
      });
    });
});

// categories tag
app.get("/categories", ensureLogin, (req, res) => {
  blog
    .getCategories()
    .then((data) => {
      if (data.length > 0) {
        res.render("categories", { data: data });
      } else {
        res.render("categories", { message: "no results" });
      }
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

// register page
app.get("/register", (req, res) => {
  res.render("register.hbs");
});

// listen to register page
app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register.hbs", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

// login page
app.get("/login", (req, res) => {
  res.render("login.hbs");
});

// listen to login page
app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName, // authenticated user's userName
        email: user.email, // authenticated user's email
        loginHistory: user.loginHistory, // authenticated user's loginHistory
      };
      res.redirect("/posts");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

//logout page
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

//userHistory page
app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

// 404 page
app.use((req, res) => {
  res.status(404).render("404");
});

//initializer
{
  blog
    .initialize()
    .then(authData.initialize)
    .then(function () {
      app.listen(HTTP_PORT, function () {
        console.log("app listening on: " + HTTP_PORT);
      });
    })
    .catch(function (err) {
      console.log("unable to start server: " + err);
    });
}
