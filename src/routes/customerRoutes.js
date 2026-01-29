const express = require("express");
const router = express.Router();
const {
  getRestaurants,
  getRestaurantMenu,
} = require("../controllers/restaurantController");

// @route   GET api/v1/customer/restaurants
// @desc    Get all nearby restaurants
// @access  Public
const {
  getFavorites,
  toggleFavorite,
  checkFavoriteStatus,
} = require("../controllers/favoritesController");
const auth = require("../middlewares/auth"); // Assuming you have auth middleware

// @route   GET api/v1/customer/restaurants
// @desc    Get all nearby restaurants
// @access  Public
router.get("/restaurants", getRestaurants);

// @route   GET api/v1/customer/restaurants/:id/menu
// @desc    Get menu of a restaurant
// @access  Public
router.get("/restaurants/:id/menu", getRestaurantMenu);

// @route   GET api/v1/customer/favorites
// @desc    Get user favorites
// @access  Private
router.get("/favorites", auth, getFavorites);

// @route   POST api/v1/customer/favorites/toggle
// @desc    Toggle favorite status
// @access  Private
router.post("/favorites/toggle", auth, toggleFavorite);

// @route   GET api/v1/customer/favorites/ids
// @desc    Get all favorite restaurant IDs
// @access  Private
router.get("/favorites/ids", auth, checkFavoriteStatus);

// Order history moved to orderRoutes.js

module.exports = router;
