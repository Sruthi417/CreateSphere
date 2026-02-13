import Category from "./category.model.js";
import { slugify } from "../../utils/slugify.js";

/* =========================================
   CREATE CATEGORY  (ADMIN)
========================================= */
export const createCategory = async (req, res) => {
  try {
    const { name, type = "both", description = "", iconUrl = null } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const slug = slugify(name);

    const exists = await Category.findOne({ slug });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      slug,
      type,
      description,

    });

    return res.status(201).json({
      success: true,
      message: "Category created",
      data: category,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};



/* =========================================
   GET ALL ACTIVE CATEGORIES (PUBLIC)
========================================= */
export const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("name slug type iconUrl");

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load categories",
    });
  }
};



/* =========================================
   GET CATEGORY BY SLUG (PUBLIC)
========================================= */
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};



/* =========================================
   UPDATE CATEGORY (ADMIN)
========================================= */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, type, description, iconUrl } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name) {
      category.name = name;
      category.slug = slugify(name);
    }

    if (type) category.type = type;
    if (description) category.description = description;
    if (iconUrl) category.iconUrl = iconUrl;

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated",
      data: category,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};



/* =========================================
   DEACTIVATE CATEGORY (SOFT DELETE)
========================================= */
export const deactivateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isActive = false;
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category deactivated",
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate category",
    });
  }
};



/* =========================================
   RE-ACTIVATE CATEGORY (ADMIN)
========================================= */
export const reactivateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isActive = true;
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category reactivated",
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to reactivate category",
    });
  }
};

/* =========================================
   DELETE CATEGORY (ADMIN ONLY)
========================================= */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any products/tutorials use this category before deleting
    const [hasProducts, hasTutorials] = await Promise.all([
      import("../products/product.model.js").then(m => m.default.exists({ categoryId: id })),
      import("../tutorials/tutorial.model.js").then(m => m.default.exists({ categoryId: id }))
    ]);

    if (hasProducts || hasTutorials) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category that has associated products or tutorials. Use deactivate instead.",
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted permanently",
    });

  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

