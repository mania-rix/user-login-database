// server.js

const express = require("express");
const path = require("path");
const app = express();
const storeService = require("./store-service");
const cloudinary = require("./cloudinaryConfig");
const multer = require("multer");
const streamifier = require("streamifier");
const upload = multer();
const { create } = require("express-handlebars");
const stripJs = require("strip-js");

//auth
const clientSessions = require('client-sessions');
const authData = require('./auth-service');
const storeData = require('./store-service');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const HTTP_PORT = process.env.PORT || 8080;

app.set('views', path.join(__dirname, 'views'));



//Configure client-sessions
app.use(clientSessions({
    cookieName: "session",
    secret: "web_demo_secret",
    duration: 2 * 60 * 1000, 
    activeDuration: 1000 * 60 
  }));
  
  app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });
  

const ensureLogin = (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
};


//Auth Routes
app.get('/register', (req, res) => res.render('register'));
app.post('/register', (req, res) => {
    console.log(req.body);
    authData
        .registerUser(req.body)
        .then(() => res.render('register', { successMessage: 'User created' }))
        .catch((err) => res.render('register', { errorMessage: err, userName: req.body.userName }));
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData
        .checkUser(req.body)
        .then((user) => {
            req.session.user = { userName: user.userName, email: user.email, loginHistory: user.loginHistory };
            res.redirect('/items');
        })
        .catch((err) => res.render('login', { errorMessage: err, userName: req.body.userName }));
});

app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory', { user: req.session.user });
});


// Configure Handlebars with custom helpers
const hbs = create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    helpers: {
        navLink: function (url, options) {
            return (
                '<li class="nav-item">' +
                '<a class="nav-link ' +
                (url === app.locals.activeRoute ? 'active' : '') +
                '" href="' + url + '">' +
                options.fn(this) +
                '</a></li>'
            );
        },
        safeHTML: (context) => purify.sanitize(context),
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
            }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
});


// Set the Handlebars engine
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Middleware to parse form data and serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set active route for highlighting navigation
app.use((req, res, next) => {
    app.locals.activeRoute = req.path;
    next();
});

// Redirect root route to /shop
app.get("/", (req, res) => res.redirect("/shop"));

// Serve static HTML views
app.get("/home", (req, res) => {
    res.render("home", { pageTitle: "Home Page" });
});

app.get("/about", (req, res) => {
    res.render("about", { pageTitle: "About Page" });
});



// Categories route
app.get("/categories", (req, res) => {
    storeService.getCategories()
        .then((categories) => {
            const cleanCategories = categories.map(cat => ({ id: cat.id, category: cat.category }));
            if (cleanCategories.length > 0) {
                res.render("categories", { categories: cleanCategories });
            } else {
                res.render("categories", { message: "No results" });
            }
        })
        .catch(() => {
            res.render("categories", { message: "Unable to fetch categories" });
        });
});

// Shop route with optional category filter
app.get("/shop", async (req, res) => {
    let viewData = {};

    try {
        if (req.query.category) {
            viewData.items = await storeService.getPublishedItemsByCategory(req.query.category);
        } else {
            viewData.items = await storeService.getPublishedItems();
        }
        viewData.items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
        viewData.item = viewData.items[0] || null;
    } catch (err) {
        console.error("Error fetching items:", err);
        viewData.items = [];
        viewData.item = null;
    }

    try {
        viewData.categories = await storeService.getCategories();
    } catch (err) {
        console.error("Error fetching categories:", err);
        viewData.categories = [];
    }

    res.render("shop", { data: viewData });
});


// Individual shop item route by ID
app.get("/shop/:id", async (req, res) => {
    let viewData = {};

    try {
        viewData.item = await storeService.getItemById(req.params.id);
    } catch (err) {
        console.error("Error fetching item:", err);
        viewData.item = null;
    }

    try {
        viewData.items = await storeService.getPublishedItems();
    } catch (err) {
        console.error("Error fetching items:", err);
        viewData.items = [];
    }

    try {
        viewData.categories = await storeService.getCategories();
    } catch (err) {
        console.error("Error fetching categories:", err);
        viewData.categories = [];
    }
    res.render("shop", { data: viewData });
});


// Items route
app.get("/items", (req, res) => {
    storeService.getAllItems()
        .then((items) => {
            if (items.length > 0) {
                res.render("items", { items });
            } else {
                res.render("items", { message: "No results" });
            }
        })
        .catch(() => {
            res.render("items", { message: "Unable to fetch items" });
        });
});

// API endpoints
app.get("/api/items", (req, res) => {
    storeService.getAllItems()
        .then((data) => res.json(data))
        .catch((err) => res.json({ message: err }));
});

app.get("/api/categories", (req, res) => {
    storeService.getCategories()
        .then((data) => res.json(data))
        .catch((err) => res.json({ message: err }));
});

// Route to render the Add Category form
app.get("/categories/add", (req, res) => {
    res.render("addCategory");
});

// Route to handle Add Category form submission
app.post("/categories/add", (req, res) => {
    storeService.addCategory(req.body)
        .then(() => res.redirect("/categories"))
        .catch(() => res.status(500).send("Unable to add category"));
});

// Route to delete a category by ID
app.get("/categories/delete/:id", (req, res) => {
    storeService.deleteCategoryById(req.params.id)
        .then(() => res.redirect("/categories"))
        .catch(() => res.status(500).send("Unable to remove category"));
});

// Route to render the Add Item form
app.post("/items/add", upload.single("featureImage"), (req, res) => {
    // Function to process the uploaded image or set a default
    const processImage = (imageUrl) => {
        req.body.featureImage = imageUrl || ""; 
        req.body.itemDate = new Date(); 

        // Add item to the database
        storeService.addItem(req.body)
            .then(() => res.redirect("/items")) 
            .catch((err) => {
                console.error("Error Adding Item:", err); 
                res.status(500).send("Unable to add item");
            });
    };

    // Check if a file was uploaded
    if (req.file) {
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) resolve(result.secure_url); 
                    else reject(error);
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream); 
            });
        };

        // Handle the stream upload
        streamUpload(req)
            .then((uploadedUrl) => processImage(uploadedUrl)) 
            .catch((error) => {
                console.error("Failed to upload image:", error); 
                res.status(500).send("Failed to upload image"); 
            });
    } else {
        processImage();
    }
});

app.get("/items/add", (req, res) => {
    storeService.getCategories()
        .then((categories) => res.render("addItem", { categories }))
        .catch(() => res.render("addItem", { categories: [] }));
});

    
// Route to delete an item by ID
app.get("/items/delete/:id", (req, res) => {
    storeService.deleteItemById(req.params.id)
        .then(() => res.redirect("/items"))
        .catch(() => res.status(500).send("Unable to remove item"));
});

// 404 Error Handling
app.use((req, res) => {
    res.status(404).render("404");
});

// Start server
storeService.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server running on port ${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.error(`Failed to initialize data: ${err}`);
    });

module.exports = app;
