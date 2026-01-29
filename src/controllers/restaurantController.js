const Restaurant = require("../models/restaurantModel");

const getRestaurants = async (req, res) => {
  try {
    const {
      lat = 10.762622,
      lng = 106.660172,
      search,
      category_id,
      min_rating,
      sort_by,
    } = req.query;
    // Default coords to HCMC center if missing for now (or validation)

    const restaurants = await Restaurant.findAll({
      lat,
      lng,
      search,
      category_id,
      min_rating,
      sort_by,
    });
    res.json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menu = await Restaurant.getMenu(id);
    res.json({
      restaurant,
      menu,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantMenu,
};
