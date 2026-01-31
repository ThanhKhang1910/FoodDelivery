-- Create User Favorites Table
CREATE TABLE IF NOT EXISTS user_favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    restaurant_id INT REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, restaurant_id) -- Prevent duplicate favorites
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);
