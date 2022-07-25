var express = require("express");
// const { response } = require('../app');

var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var itemHelpers = require("../helpers/product-management");
const userHelpers = require("../helpers/user-helpers");
let userName = "admin";
let Pin = "admin123";
const store = require("../multer/multer");

const varifyLogin = (req, res, next) => {
  if (req.session.users) {
    next();
  } else {
    res.render("admin/admin-login", { admin: true, errout: req.session.err });
    req.session.err = false;
  }
};

/* GET users listing. */
router.get("/", function (req, res, next) {
  if (req.session.users) {
    res.redirect("/admin/view-users");
  } else {
    res.render("admin/admin-login", { admin: false, errout: req.session.err });
    req.session.err = false;
  }
});

router.get("/view-users", varifyLogin, (req, res, next) => {
  productHelpers.getAlluser().then((products) => {
    res.render("admin/view-users", { admin: true, products });
  });
});



//admin- user full details
router.get("/view-user/:id", varifyLogin, (req, res, next) => {
  productHelpers.getProductDetails(req.params.id).then((user) => {
    console.log(user);
      res.render("admin/userprofile", { admin: true, user });
  })
  
  
});



router.get("/add-user", varifyLogin, function (req, res) {
  res.render("admin/add-user", { admin: true });
});

router.post("/add-user", (req, res) => {
  productHelpers.doAdd(req.body).then((response) => {
    res.redirect("/admin");
  });
});
router.post("/view-users", (req, res) => {
  const { Email, Password } = req.body;
  if (userName === Email && Pin === Password) {
    req.session.check = true;
    req.session.users = {
      userName,
    };
    productHelpers.getAlluser().then((products) => {
      res.redirect("/admin/view-users");
    });
  } else {
    req.session.err = "incorrect username or password";
    res.redirect("/admin");
  }
});
//user delete
router.get("/delete-product/:id", varifyLogin, (req, res) => {
  let proId = req.params.id;
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/");
  });
});
router.get("/update-user/:id", varifyLogin, async (req, res) => {
  let user = await productHelpers.getProductDetails(req.params.id);
  res.render("admin/update-user", { user, admin: true });
});
router.post("/update-user/:id", (req, res) => {
  productHelpers.updateUser(req.params.id, req.body).then((response) => {
    res.redirect("/admin");
  });
});

//product delete
router.get("/product-delete/:id", varifyLogin, (req, res) => {
  let proId = req.params.id;
  itemHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/view-products");
  });
});

//edit product
router.get("/edit-product/:id", varifyLogin, async (req, res) => {
  let editProduct = await itemHelpers.getProductData(req.params.id);
  let categories = await itemHelpers.getCategories();
  console.log(categories);
  res.render("admin/edit-product", {
    editProduct,
    categories,
    admin: true,
    adminHead: true,
  });
});

//edit-product-post
router.post("/product-edit/:id", varifyLogin, async (req, res) => {
  let editProduct = await itemHelpers.updateProduct(req.params.id, req.body);
  res.render("admin/edit-product", {
    editProduct,
    admin: true,
    adminHead: true,
  });
});

//adding products

router.get("/add-products", varifyLogin, (req, res) => {
  itemHelpers.getCategories().then((cat) => {
    res.render("admin/add-products", { cat, admin: true });
  });
});

router.post("/add-item", store.array("image", 4), (req, res) => {
  console.log("im working");
  const files = req.files;
  if (!files) {
    const err = new Error("please choose the images");
    res.redirect("/add-products", err);
  }
  //res.render("admin/add-products", { admin: true });
  var filenames = req.files.map(function (file) {
    return file.filename;
  });

  req.body.Image = filenames;
  itemHelpers.addItem(req.body).then((resolve) => {
    console.log(req.body);
    res.redirect("/admin/add-products");
  });
});

router.get("/add-categories", varifyLogin, (req, res) => {
  res.render("admin/Add-category", { admin: true });
});

router.get("/view-products", varifyLogin, (req, res) => {
  itemHelpers.getAllproducts().then((products) => {
    res.render("admin/view-products", { admin: true, products });
  });
});

//categories

router.get("/categories", varifyLogin, (req, res) => {
  itemHelpers.getAllcategories().then((categories) => {
    res.render("admin/categories", { admin: true, categories });
  });
});


router.get("/delete-category/:id", varifyLogin, (req, res) => {
  itemHelpers.deleteCategory(req.params.id).then((categories) => {
    res.redirect("/admin/categories",);
  });
});



router.post("/add-category", (req, res) => {
  //let category = req.body;
  console.log(req.body);
  itemHelpers.addCategory(req.body);
  res.redirect("/admin/add-categories");
});

router.get("/edit-categories/:id", varifyLogin, (req, res) => {
  itemHelpers.getCategory(req.params.id).then((category) => {
    res.render("admin/editCat", { category });
  });
});

router.post("/edit-category/:id", (req, res) => {
  //let category = req.body;
  console.log(req.params.id);
  itemHelpers.updateCategory(req.params.id, req.body);
   
 res.redirect("/admin/categories");
});

router.post("/add-category", (req, res) => {
  //let category = req.body;
  console.log(req.body);
  itemHelpers.addCategory(req.body);
  res.redirect("/admin/add-categories");
});

router.get("/Block-user/:id", varifyLogin, (req, res) => {
  let userId = req.params.id;
  userHelpers.blockUser(userId).then((response) => {
    req.session.user = null;
    req.session.loggedIn = null;
    res.redirect("/admin/view-users");
  });
});
router.get("/Un-Block-user/:id", varifyLogin, (req, res) => {
  let userId = req.params.id;
  userHelpers.unBlockUser(userId).then((response) => {
    req.session.user = null;
    req.session.loggedIn = null;
    res.redirect("/admin/view-users");
  });
});

router.get("/logout", varifyLogin, (req, res) => {
  req.session.users = null;
  res.redirect("/admin");
});

module.exports = router;
