import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useCart } from "../context/CartContext";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, totalAmount } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axiosClient.get(`/customer/restaurants/${id}/menu`);
        setRestaurant(res.data.restaurant);
        setMenu(res.data.menu);
      } catch (error) {
        console.error("Failed to fetch menu", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [id]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!restaurant)
    return <div className="text-center mt-10">Restaurant not found</div>;

  return (
    <div className="container mx-auto p-4 pb-24">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {restaurant.shop_name}
        </h1>
        <p className="text-gray-600 mt-2">{restaurant.address}</p>
        <div className="flex items-center mt-2 space-x-4">
          <span className="text-amber-500 font-bold text-lg">
            ★ {restaurant.rating}
          </span>
          <span
            className={`px-2 py-1 rounded text-sm ${restaurant.is_open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {restaurant.is_open ? "Open Now" : "Closed"}
          </span>
        </div>
      </div>

      {/* Menu List */}
      <div className="space-y-8">
        {menu.map((category) => (
          <div key={category.category_id}>
            <h2 className="text-2xl font-bold mb-4 text-gray-700 border-b pb-2">
              {category.category_name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map((food) => (
                <div
                  key={food.food_id}
                  className="bg-white p-4 rounded-lg shadow flex justify-between hover:shadow-md transition group"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{food.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {food.description}
                    </p>
                    <p className="text-primary font-bold mt-2">
                      {parseInt(food.price).toLocaleString()} đ
                    </p>
                  </div>
                  <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0 ml-4 relative">
                    {/* Image Placeholder */}
                    {food.image_url && (
                      <img
                        src={food.image_url}
                        alt={food.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    )}
                    <button
                      onClick={() => addToCart(food, restaurant.restaurant_id)}
                      className="absolute -bottom-2 -right-2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 active:scale-95 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Footer */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-50">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">{cartItems.length} items</p>
              <p className="text-xl font-bold text-primary">
                {totalAmount.toLocaleString()} đ
              </p>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-green-600"
            >
              View Basket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
