var express = require("express");
const session = require("express-session");
require("dotenv").config();
var router = express.Router();
const userHelpers = require("../helpers/user-helpers");
var productHelpers = require("../helpers/product-management");
const cartHelpers = require("../helpers/cart-helpers");
const { response } = require("express");




const varifyLogin = (req, res, next) => {

  if (req.session.user) {
    next();
  } else {
    res.render("user/login");
    req.session.err = false;
  }
};


const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN,
  {
    lazyLoading: true,
  }
);

let User_number = "";

/* GET home page. */
router.get("/", async function (req, res, next) {
  let cartCount = 0;
  let user = req.session.user;
  let U_session = req.session;
  userHelpers.isExist(U_session);
  if (req.session.user) {
    cartCount = await cartHelpers.getCount(req.session.user._id);
   
  }
 

  productHelpers.getAllproducts().then((products) => {
    let men = [];
    let women = [];

    products.map((data) => {
      if (data.category == "men") {
        men.push(data);
      } else if (data.category == "women") {
        women.push(data);
      }
    });

    res.render("index", { women, men, user,cartCount });
    
  });
});

router.get("/login", function (req, res) {
  let blocked = req.session.blockedUser;

  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginerr: req.session.loginErr, blocked });
    req.session.loginErr = false;
    blocked = false;
  }
});

//otp section

router.get("/otp-login", function (req, res) {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/otp");
    req.session.loginErr = false;
  }
});

router.post("/otp-verification", function (req, res) {
  userHelpers.NumberExist(req.body.number).then((resp) => {
   
    if (resp.userExist == false) {
      res.render("user/otp", { UserNotExist: true });
    } else {
      if (resp.userBlock !== true) {
        console.log("it should be working");
       // req.session.user = resp.Email;
        req.session.user = resp;
        
       // req.session = resp
        const { number } = req.body;
       
        User_number = number;
        client.verify.services(process.env.SERVICE_SID).verifications.create({
          to: `+91${number}`,
          channel: "sms",
        });
      }
      res.render("user/otp-veri", { user: resp.user });
    }
  });
});

router.post("/otp-matching", function (req, res) {
  const { otp } = req.body;

  client.verify
    .services(process.env.SERVICE_SID)
    .verificationChecks.create({
      to: `+91${User_number}`,
      channel: "sms",
      code: otp,
    })
    .then((resp) => {
    
      if (resp.valid == false) {
        req.session.otp = true;
        let otpvalidation = req.session.otp;
        res.render("user/otp-veri", { otpvalidation });
      } else if (resp.valid == true) {
         
        res.redirect("/");
      }
    });
});

router.get("/signup", function (req, res) {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/signup", {
      signerr: req.session.signErr,
      phoneerr: req.session.phnExists,
    });
    req.session.signErr = false;
    req.session.phnExists = false;
  }
});

router.post("/signup", (req, res) => {
  let reqBody = req.body;
  reqBody.block = false;
  //console.log(reqBody)
  userHelpers.doSignup(reqBody).then((response) => {
    if (response.status) {
      req.session.signErr = true;
      res.redirect("/signup");
    } else if (response.phone) {
      req.session.phnExists = true;
      res.redirect("/signup");
    } else {
      res.redirect("/login");
    }
  });
});

//view-product

router.get("/view-product/:id", function (req, res) {
  productHelpers.getProductData(req.params.id).then((Product) => {
    res.render("user/product-view", { Product, userHead: true });
  });
});

router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.userBlock) {
      req.session.blockedUser = true;
      res.redirect("/login");
    } else if (response.status) {
      req.session.user = response.user;
      req.session.user = response.user;
      console.log(req.session.user);
      req.session.loggedIn = true;
      res.redirect("/");
    } else {
      req.session.loginErr = true;
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.loggedIn = null;
  req.session.user = null;
  res.redirect("/");
});



// cart section
router.get("/cart",varifyLogin, async function (req, res) {
  let cartCount = 0;
  cartCount = await cartHelpers.getCount(req.session.user._id);
  let user = req.session.user;
   cartHelpers.getCartProducts(req.session.user._id).then(async (data) => {
     let total = await cartHelpers.getTotalAmount(req.session.user._id);
     res.render("user/Cart", { user, data, cartCount, total });
   });
    
  // if (req.session.loggedIn) {
  //    let user = req.session.user;
   
   
  // } else {
    
  //   res.redirect("/login");
  // }
 
}); 

router.post("/add-to-cart/:id", varifyLogin, (req, res) => {
  cartHelpers.addToCart(req.params.id, req.session.user._id).then((data) => {
    res.json(data);
  });
});


router.post("/change-product-quantity",varifyLogin, (req, res) => {
  cartHelpers.changeProductQuantity(req.body).then(async(response) => {
    let total = await cartHelpers.getTotalAmount(req.session.user._id);
   
    if (total > 0) {
      response.total = total;
    }
    res.json(response)
  })
}) 

router.get("/checkout", varifyLogin, async (req, res) => {
  let user = req.session.user;
  let total = await cartHelpers.getTotalAmount(req.session.user._id);
  
    res.render("user/checkout", { user, total, Empty: false });
  
})

router.post("/checkout-form",varifyLogin, async (req, res) => {
  let user = req.session.user;
 
  let products= await cartHelpers.getCartProductList(req.body.userId)
  let totalPrice = await cartHelpers.getTotalAmount(req.body.userId);
  cartHelpers.placeOrder(req.body,products,totalPrice).then((response) => {
    res.json({status:true})
  })
 
  //res.render("user/checkout", { user,total });
   
})

//orders list

router.get("/orders-list", varifyLogin, async (req, res) => {
  let user = req.session.user;
  let orders = await cartHelpers.getUserOrders(user._id);
  
  res.render("user/orderslist", { user, orders });
});

router.get("/view-order-details/:id", varifyLogin, async (req, res) => {
  let user = req.session.user;
  let products = await cartHelpers.getOrderProducts(req.params.id);
 
  res.render("user/view-ordered-products", { user, products });
});
 
//user profile
router.get("/my-account/:id", varifyLogin, (req, res) => {
  let user = req.session.user;
  userHelpers.getUserDetails(user._id).then((data) => { 
    res.render("user/user-account", { user, data });
   
  })
});

router.get("/user-profile-update", varifyLogin, (req, res) => {
  res.render("user/addressupdate")

});

router.post("/user-address-update", varifyLogin, (req, res) => {
   let user = req.session.user;
  userHelpers.updateAddressDetails(user._id, req.body).then((response) => {
    res.json(response)
  })
 
});






//profile edit

router.get("/profile-edit/:id", varifyLogin, (req, res) => {
  let user = req.session.user;
  userHelpers.getUserDetails(user._id).then((data) => {
    res.render("user/profile-edit", { user,data });
  })

  
});

router.post("/profile-edit", varifyLogin, (req, res) => {
  let user = req.session.user;
  userHelpers.updatePersonalDetails(user._id, req.body).then((response) => {
    res.json(response)
  })
  
});



//change-password

router.get("/change-password/:id", varifyLogin, (req, res) => {
  let user = req.session.user;
 
  res.render("user/changePassword", { user });
});

router.post("/change-password/", varifyLogin, (req, res) => {
  let user = req.session.user;
  userHelpers.updateUser(user._id, req.body).then((response) => {
    res.json(response)
  })
  

});



router.post("/delete-cart-product", varifyLogin, (req, res) => {

  let user = req.session.user;
  productHelpers.deleteCartItem(req.body.cart, req.body.product).then((response) => {
     res.json(response)
   })
 
});


router.post("/user-cancel-order", varifyLogin, (req, res) => {
  
  let user = req.session.user;
  userHelpers.changeOrderStatus(req.body.order).then((response) => {
    res.json(response)
  })
});









module.exports = router;
