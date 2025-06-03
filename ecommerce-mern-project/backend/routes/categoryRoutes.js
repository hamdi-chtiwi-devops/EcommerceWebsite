const express = require('express');
const Category = require('../models/CategoryModel');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// --- POST /api/categories (Create Category - Admin Only) ---
router.post('/', protect, admin, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }

  try {
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category with this name already exists.' });
    }

    const category = new Category({ name });
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error while creating category.' });
  }
});

// --- GET /api/categories (Get All Categories - Public) ---
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories.' });
  }
});

// --- PUT /api/categories/:id (Update Category - Admin Only) ---
router.put('/:id', protect, admin, async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required for update.' });
  }

  try {
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Check if another category with the new name already exists (optional, but good for uniqueness)
    if (name !== category.name) {
        const existingCategoryWithNewName = await Category.findOne({ name });
        if (existingCategoryWithNewName) {
            return res.status(400).json({ message: 'Another category with this name already exists.' });
        }
    }


    category.name = name;
    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Category not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while updating category.' });
  }
});

// --- DELETE /api/categories/:id (Delete Category - Admin Only) ---
router.delete('/:id', protect, admin, async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // TODO: Consider implications if products are using this category.
    // For now, simple delete. Later, might need to disassociate or prevent deletion.
    await category.deleteOne(); // mongoose v6+ uses deleteOne() or deleteMany() on model instances

    res.status(200).json({ message: 'Category removed successfully.' });
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Category not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while deleting category.' });
  }
});

module.exports = router;
