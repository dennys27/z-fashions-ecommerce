var db = require("../config/connection");
var collection = require("../config/collections");
const { ObjectId } = require("mongodb");
const { response } = require("express");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
module.exports = {
  // addUser:(product,callback)=>{

  //     db.get().collection('user').insertOne(product).then((data)=>{

  //         callback(data)
  //     })
  // },
  getAllproducts: (prodId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .find()
        .toArray();
      resolve(products);
    });
  },

  getAllcategories: (prodId) => {
    return new Promise(async (resolve, reject) => {
      let categories = await db
        .get()
        .collection(collection.PRODUCT_CATAGORY)
        .find()
        .toArray();
      resolve(categories);
    });
  },


  getCategories: (prodId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_CATAGORY)
        .find()
        .toArray();
      resolve(products);
    });
  },

  getProductData: (editProduct) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .findOne({ _id:objectId(editProduct) })
        .then((productData) => {
          resolve(productData);
          
        });
    });
  },

  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .deleteOne({ _id: objectId(prodId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getProductDetails: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .findOne({ _id: objectId(prodId) })
        .then((user) => {
          resolve(user);
        });
    });
  },
  //ADD-PRODUCT
  addItem: (userData) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .insertOne(userData)
        .then((data) => {
          resolve(data.insertedId);
        });
    });
  },

  //ADD-CATEGORY
  addCategory: (userData) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_CATAGORY)
        .insertOne(userData)
        .then((data) => {
          resolve(data.insertedId);
        });
    });
  },
  updateUser: (proId, proDetals) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .updateOne(
          { _id: objectId(proId) },
          {
            $set: {
              Email: proDetals.Email,
              Password: proDetals.Password,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
};
