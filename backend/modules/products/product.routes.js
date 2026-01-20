import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

import {
  createProduct,
  getProduct,
  listCreatorProducts,
  listMyProducts,
  updateProduct,
  removeProduct,
  restoreProduct,
  listAllProducts,
  listProductsByCategory,
  searchProducts
} from "./product.controller.js";

const productRouter = Router();


//
// =====================
//  PUBLIC LISTING ROUTES
// =====================
//

// Explore feed (cards)
productRouter.get("/", listAllProducts);

// Search products
productRouter.get("/search", searchProducts);

// Filter by category
productRouter.get("/category/:categoryId", listProductsByCategory);

// View all products of a creator
productRouter.get("/creator/:creatorId", listCreatorProducts);


//
// =====================
//  CREATOR DASHBOARD ROUTES
// =====================
//

// My products (includes hidden/removed)
productRouter.get("/me/list",authMiddleware,requireRole("creator"),listMyProducts);


//
// =====================
//  CREATOR PRODUCT ACTIONS
// =====================
//

productRouter.post("/",authMiddleware,requireRole("creator"),createProduct);

productRouter.put("/:productId",authMiddleware,requireRole("creator"),updateProduct);

productRouter.delete("/:productId",authMiddleware,requireRole("creator"),removeProduct);

productRouter.post("/:productId/restore",authMiddleware,requireRole("creator"),restoreProduct);


//
// =====================
//  PRODUCT DETAILS (MUST BE LAST)
// =====================
//

// Single product full details
productRouter.get("/:productId", getProduct);

export default productRouter;
