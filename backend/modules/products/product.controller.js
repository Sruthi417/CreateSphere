import Product from "./product.model.js";
import User from "../users/user.model.js";
import { checkAndAutoVerify } from "../../utils/verification.utils.js";


/* =========================================================
   CREATE PRODUCT (Creator Upload)
========================================================= */
export const createProduct = async (req, res) => {
  try {
    const creatorId = req.user.id;

    const creator = await User.findById(creatorId);

    if (!creator || creator.role !== "creator") {
      return res.status(403).json({
        success: false,
        message: "Only creators can upload products",
      });
    }

    const product = await Product.create({
      creatorId,
      ...req.body,
      status: "active",
      reportsCount: 0,
    });

    // attach to creator profile
    creator.creatorProfile.products.push(product._id);
    await creator.save();

    // Trigger auto-verification check
    await checkAndAutoVerify(creatorId);

    return res.status(201).json({
      success: true,
      message: "Product published successfully",
      data: product,
    });

  } catch {
    return res.status(400).json({
      success: false,
      message: "Failed to create product",
    });
  }
};



/* =========================================================
   GET SINGLE PUBLIC PRODUCT (Full Detail View)
========================================================= */
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      status: "active",
      visibility: "public",
    }).populate("creatorId", "name avatarUrl creatorProfile");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};



/* =========================================================
   EXPLORE — LIST ALL PUBLIC PRODUCTS (Paginated)
========================================================= */
export const listAllProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const sort =
      req.query.sort === "oldest"
        ? { createdAt: 1 }
        : { createdAt: -1 };

    const products = await Product.find({
      status: "active",
      visibility: "public",
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(
        "title images creatorId categoryId averageRating reviewsCount isCustomizable createdAt shortDescription description"
      ).lean();

    // ensure card summary exists
    products.forEach(p => {
      p.shortDescription =
        p.shortDescription ||
        (p.description ? p.description.slice(0, 120) + "..." : "");
    });

    const total = await Product.countDocuments({
      status: "active",
      visibility: "public",
    });

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: products.length,
      data: products,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load products",
    });
  }
};



/* =========================================================
   LIST PRODUCTS BY CATEGORY (Paginated)
========================================================= */
export const listProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const products = await Product.find({
      categoryId,
      status: "active",
      visibility: "public",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "title images creatorId averageRating reviewsCount isCustomizable createdAt"
      ).lean();

    products.forEach(p => {
      p.shortDescription =
        p.shortDescription ||
        (p.description ? p.description.slice(0, 120) + "..." : "");
    });




    const total = await Product.countDocuments({
      categoryId,
      status: "active",
      visibility: "public",
    });

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: products.length,
      data: products,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load category products",
    });
  }
};



/* =========================================================
   LIST CREATOR PUBLIC PRODUCTS (Profile View)
========================================================= */
export const listCreatorProducts = async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const products = await Product.find({
      creatorId,
      status: "active",
      visibility: "public",
    })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};



/* =========================================================
   CREATOR DASHBOARD — LIST ALL MY PRODUCTS
========================================================= */
export const listMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      creatorId: req.user.id,
    })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load your products",
    });
  }
};



/* =========================================================
   UPDATE PRODUCT
========================================================= */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      creatorId: req.user.id,
    });

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    if (product.status === "removed") {
      return res.status(400).json({
        success: false,
        message: "Restore product before editing",
      });
    }

    Object.assign(product, req.body);

    if (product.status === "hidden") {
      if (product.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "This product is blocked by an admin and cannot be reactivated manually."
        });
      }
      product.status = "active"; // auto-reactivate if fixed
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated",
      data: product,
    });

  } catch {
    return res.status(400).json({
      success: false,
      message: "Failed to update product",
    });
  }
};



/* =========================================================
   SOFT DELETE PRODUCT (Creator Remove)
========================================================= */
export const removeProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      creatorId: req.user.id,
    });

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    product.status = "removed";
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product removed (can be restored)",
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to remove product",
    });
  }
};



/* =========================================================
   RESTORE PRODUCT
========================================================= */
export const restoreProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      creatorId: req.user.id,
      status: "removed",
    });

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found or not removed",
      });

    product.status = "active";

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product restored",
      data: product,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to restore product",
    });
  }
};



/* =========================================================
   SEARCH PRODUCTS (Paginated)
========================================================= */
export const searchProducts = async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q)
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const filter = {
      status: "active",
      visibility: "public",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { "metadata.materialsUsed": { $regex: q, $options: "i" } },
      ],
    };

    const results = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "title images creatorId averageRating reviewsCount isCustomizable createdAt"
      ).lean();

    results.forEach(p => {
      p.shortDescription =
        p.shortDescription ||
        (p.description ? p.description.slice(0, 120) + "..." : "");
    });


    const total = await Product.countDocuments(filter);

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: results.length,
      data: results,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};
