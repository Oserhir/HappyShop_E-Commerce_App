const productModel = require("../models/productSchema");
const Joi = require("joi");
const _ = require("lodash");

exports.createProduct = (req, res) => {
  // Joi Validation
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    category: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });
  }
  // image not Found
  if (req.file == null) {
    res.status(400).json({ error: "image could not upload" });
  }

  // image should be less than 3MB in size
  if (req.file.size > Math.pow(10, 6) * 3) {
    return res
      .status(400)
      .json({ error: "File size exceeds the allowable limit of(3MB)" });
  }

  const { name, description, price, quantity, category } = value;
  const image = req.file.path;

  productModel
    .create({ name, description, price, quantity, image, category })
    .then((product) => {
      res.status(201).json({ data: product });
    })
    .catch((err) => {
      res.status(400).json(err.message);
    });
};

exports.productById = (req, res, next, id) => {
  productModel.findById(id).exec((err, product) => {
    if (err || !product) {
      return res.status(404).json({
        errors: "Product not found !",
      });
    }

    req.product = product;
    next();
  });
};

exports.showProduct = (req, res) => {
  res.json({
    data: req.product,
  });
};

exports.removeProduct = (req, res) => {
  let product = req.product;
  product.remove((err, product) => {
    if (err) {
      return res.status(404).json({ error: "Product not found !" });
    }
  });

  res.status(204).json({});
};

exports.updateProduct = (req, res) => {
  // Joi Validation
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    category: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  // let image;

  if (error) {
    res.status(400).json({ error: error.details[0].message });
  }

  // image not Found
  if (req.file == null) {
    res.status(400).json({ error: "image could not upload" });
  }

  // image should be less than 3MB in size
  if (req.file) {
    if (req.file.size > Math.pow(10, 6) * 3) {
      return res
        .status(400)
        .json({ error: "File size exceeds the allowable limit of(3MB)" });
    }

    image = req.file.path;
  }

  //const { name, description, price, quantity, category } = value;

  let product = req.product;
  value.image = image || product.image;
  product = _.extend(product, value);

  product.save((err, product) => {
    if (err) {
      res.status(400).json({
        error: "Product update failed",
      });
    }

    res.json({ data: product });
  });
};

exports.allProducts = (req, res) => {
  /*
   * By sell = /products?sortedBy=sold&orders=desc&limit=4
   * By arrival = /products?sortedBy=createdAt&orders=desc&limit=4
   * if no params are sent, then all products are returned
   */

  let sortedBy = req.query.sortedBy ? req.query.sortedBy : "_id";
  let order = req.query.order ? req.query.order : "asc";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  productModel
    .find()
    .select("-image")
    .populate({ path: "category", select: "name _id" })
    .sort([[sortedBy, order]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(404).json({ error: "Products not found !" });
      }

      res.json({ data: products });
    });
};

exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  productModel
    .find({ category: req.product.category, _id: { $ne: req.product._id } })
    .limit(limit)
    .select("-image")
    .populate("category", "_id name")
    .exec((err, products) => {
      if (err) {
        res.status(404).json({ err: "Produts not found !" });
      }

      res.json(products);
    });
};

exports.searchProduct = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  console.log(req.body.filters);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  productModel
    .find(findArgs)
    .select("-image")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json({
        size: data.length,
        data,
      });
    });
};
