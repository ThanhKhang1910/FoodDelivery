const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "bronauto",
  password: process.env.DB_PASSWORD || "admin",
  port: process.env.DB_PORT || 5432,
});

async function addRealMartStores() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log("Adding real mart store users...");
    await client.query(`
      INSERT INTO Users (user_id, full_name, email, phone_number, password_hash, role, status)
      VALUES
        (2001, 'VinMart+ Thảo Điền', 'vinmart.thaodien@store.vn', '0281234001', '$2b$10$hashedpassword', 'RESTAURANT', 'ACTIVE'),
        (2002, 'Circle K Nguyễn Đình Chiểu', 'circlek.ndchieu@store.vn', '0281234002', '$2b$10$hashedpassword', 'RESTAURANT', 'ACTIVE'),
        (2003, 'GS25 Phan Xích Long', 'gs25.pxlong@store.vn', '0281234003', '$2b$10$hashedpassword', 'RESTAURANT', 'ACTIVE'),
        (2004, 'FamilyMart Quận 1', 'familymart.q1@store.vn', '0281234004', '$2b$10$hashedpassword', 'RESTAURANT', 'ACTIVE'),
        (2005, 'MiniStop Bình Thạnh', 'ministop.binhthanh@store.vn', '0281234005', '$2b$10$hashedpassword', 'RESTAURANT', 'ACTIVE'),
        (2006, 'Co.op Food Đặng Văn Ngữ', 'coopfood.dvngu@store.vn', '0281234006', '$2b$10$hashedpassword', 'RESTAURANT', 'ACTIVE')
      ON CONFLICT (user_id) DO NOTHING
    `);

    console.log("Adding real mart restaurants...");
    await client.query(`
      INSERT INTO Restaurants (restaurant_id, shop_name, address, latitude, longitude, is_open, rating)
      VALUES
        (2001, 'VinMart+ Thảo Điền', '123 Xuân Thủy, Thảo Điền, Quận 2, TP.HCM', 10.8076, 106.7315, TRUE, 4.8),
        (2002, 'Circle K Nguyễn Đình Chiểu', '456 Nguyễn Đình Chiểu, Quận 3, TP.HCM', 10.7769, 106.6909, TRUE, 4.7),
        (2003, 'GS25 Phan Xích Long', '789 Phan Xích Long, Phú Nhuận, TP.HCM', 10.7993, 106.6827, TRUE, 4.9),
        (2004, 'FamilyMart Quận 1', '321 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM', 10.7769, 106.7009, TRUE, 4.6),
        (2005, 'MiniStop Bình Thạnh', '654 Điện Biên Phủ, Phường 15, Bình Thạnh, TP.HCM', 10.8015, 106.7100, TRUE, 4.5),
        (2006, 'Co.op Food Đặng Văn Ngữ', '147 Đặng Văn Ngữ, Phường 10, Phú Nhuận, TP.HCM', 10.7993, 106.6827, TRUE, 4.4)
      ON CONFLICT (restaurant_id) DO NOTHING
    `);

    console.log("Adding categories for mart stores...");
    await client.query(`
      INSERT INTO Categories (category_id, restaurant_id, name)
      VALUES
        -- VinMart+ categories
        (3001, 2001, 'Đồ uống'), (3002, 2001, 'Rau củ quả'), (3003, 2001, 'Thực phẩm tươi sống'), (3004, 2001, 'Đồ gia dụng'),
        -- Circle K categories
        (3005, 2002, 'Đồ uống'), (3006, 2002, 'Snack & Bánh kẹo'), (3007, 2002, 'Thực phẩm nhanh'), (3008, 2002, 'Tiện ích'),
        -- GS25 categories
        (3009, 2003, 'Đồ uống'), (3010, 2003, 'Snack Hàn Quốc'), (3011, 2003, 'Mỳ & Cơm hộp'), (3012, 2003, 'Mỹ phẩm'),
        -- FamilyMart categories
        (3013, 2004, 'Đồ uống'), (3014, 2004, 'Snack'), (3015, 2004, 'Cơm hộp'), (3016, 2004, 'Tiện lợi'),
        -- MiniStop categories
        (3017, 2005, 'Đồ uống'), (3018, 2005, 'Kem'), (3019, 2005, 'Bánh mì'), (3020, 2005, 'Đồ ăn nhanh'),
        -- Co.op Food categories
        (3021, 2006, 'Đồ uống'), (3022, 2006, 'Rau củ'), (3023, 2006, 'Thực phẩm'), (3024, 2006, 'Gia vị')
      ON CONFLICT (category_id) DO NOTHING
    `);

    console.log("Adding products for VinMart+...");
    await client.query(`
      INSERT INTO Foods (restaurant_id, category_id, name, price, description, is_available) VALUES
      (2001, 3001, 'Coca Cola 330ml', 12000, 'Nước ngọt có ga', TRUE),
      (2001, 3001, 'Trà xanh C2 455ml', 10000, 'Trà xanh không độ', TRUE),
      (2001, 3001, 'Nước suối Lavie 500ml', 5000, 'Nước khoáng tinh khiết', TRUE),
      (2001, 3002, 'Cà chua Đà Lạt 500g', 25000, 'Cà chua tươi', TRUE),
      (2001, 3002, 'Xà lách 200g', 15000, 'Xà lách tươi', TRUE),
      (2001, 3003, 'Trứng gà VinEco 10 quả', 35000, 'Trứng gà sạch', TRUE),
      (2001, 3003, 'Thịt heo VinEco 500g', 75000, 'Thịt heo sạch', TRUE),
      (2001, 3004, 'Giấy vệ sinh 10 cuộn', 45000, 'Giấy vệ sinh mềm', TRUE),
      (2001, 3004, 'Nước rửa chén Sunlight 800g', 35000, 'Nước rửa chén', TRUE),
      (2001, 3001, 'Sữa tươi TH True Milk 1L', 35000, 'Sữa tươi tiệt trùng', TRUE)
    `);

    console.log("Adding products for Circle K...");
    await client.query(`
      INSERT INTO Foods (restaurant_id, category_id, name, price, description, is_available) VALUES
      (2002, 3005, 'Pepsi 330ml', 12000, 'Nước ngọt có ga', TRUE),
      (2002, 3005, 'Sting Dâu 330ml', 10000, 'Nước tăng lực', TRUE),
      (2002, 3005, 'Nước suối Aquafina 500ml', 8000, 'Nước khoáng', TRUE),
      (2002, 3006, 'Snack Oishi 42g', 8000, 'Snack giòn tan', TRUE),
      (2002, 3006, 'Bánh Oreo 137g', 18000, 'Bánh quy kem', TRUE),
      (2002, 3006, 'Kẹo Mentos 37.5g', 12000, 'Kẹo nhai', TRUE),
      (2002, 3007, 'Sandwich Gà', 25000, 'Bánh mì sandwich', TRUE),
      (2002, 3007, 'Hot Dog', 20000, 'Xúc xích kẹp bánh', TRUE),
      (2002, 3008, 'Khẩu trang 10 cái', 25000, 'Khẩu trang y tế', TRUE),
      (2002, 3005, 'Cà phê Highlands 235ml', 25000, 'Cà phê sữa đá', TRUE)
    `);

    console.log("Adding products for GS25...");
    await client.query(`
      INSERT INTO Foods (restaurant_id, category_id, name, price, description, is_available) VALUES
      (2003, 3009, 'Milkis 250ml', 15000, 'Nước ngọt sữa Hàn Quốc', TRUE),
      (2003, 3009, 'Trà Ô Long 500ml', 16000, 'Trà xanh Hàn Quốc', TRUE),
      (2003, 3009, 'Cà phê Maxim 100 gói', 85000, 'Cà phê hòa tan', TRUE),
      (2003, 3010, 'Honey Butter Chip', 35000, 'Snack khoai tây', TRUE),
      (2003, 3010, 'Choco Pie 360g', 42000, 'Bánh pie socola', TRUE),
      (2003, 3010, 'Kẹo dẻo Haribo 100g', 28000, 'Kẹo dẻo trái cây', TRUE),
      (2003, 3011, 'Mì Shin Ramyun', 18000, 'Mì cay Hàn Quốc', TRUE),
      (2003, 3011, 'Cơm cuộn Kimbap', 32000, 'Cơm cuộn rong biển', TRUE),
      (2003, 3012, 'Mặt nạ Mediheal 10 miếng', 120000, 'Mặt nạ dưỡng da', TRUE),
      (2003, 3011, 'Mì Jjapaguri', 25000, 'Mì đen Hàn Quốc', TRUE)
    `);

    console.log("Adding products for FamilyMart...");
    await client.query(`
      INSERT INTO Foods (restaurant_id, category_id, name, price, description, is_available) VALUES
      (2004, 3013, 'Fanta Cam 330ml', 12000, 'Nước ngọt vị cam', TRUE),
      (2004, 3013, 'Nước ép Twister 1L', 22000, 'Nước ép trái cây', TRUE),
      (2004, 3014, 'Lays 52g', 15000, 'Snack khoai tây', TRUE),
      (2004, 3014, 'Pocky 47g', 18000, 'Bánh que socola', TRUE),
      (2004, 3014, 'Hạt điều 100g', 45000, 'Hạt điều rang muối', TRUE),
      (2004, 3015, 'Cơm Gà Teriyaki', 38000, 'Cơm hộp gà', TRUE),
      (2004, 3015, 'Mì Ý Bò Bằm', 42000, 'Mì Ý sốt bò', TRUE),
      (2004, 3015, 'Bánh bao Thịt', 15000, 'Bánh bao hấp', TRUE),
      (2004, 3016, 'Pin AA 4 viên', 35000, 'Pin tiểu', TRUE),
      (2004, 3013, 'Trà sữa Olong 500ml', 18000, 'Trà sữa đài loan', TRUE)
    `);

    console.log("Adding products for MiniStop...");
    await client.query(`
      INSERT INTO Foods (restaurant_id, category_id, name, price, description, is_available) VALUES
      (2005, 3017, 'Sprite 330ml', 12000, 'Nước ngọt chanh', TRUE),
      (2005, 3017, 'Nước cam Minute Maid 1L', 28000, 'Nước cam ép', TRUE),
      (2005, 3018, 'Kem Cornetto 67ml', 15000, 'Kem ốc quế', TRUE),
      (2005, 3018, 'Kem Magnum', 28000, 'Kem que socola', TRUE),
      (2005, 3018, 'Sữa chua Vinamilk 100g', 8000, 'Sữa chua có đường', TRUE),
      (2005, 3019, 'Bánh mì Phô mai', 22000, 'Bánh mì nướng', TRUE),
      (2005, 3019, 'Sandwich Cá Ngừ', 28000, 'Sandwich nhân cá', TRUE),
      (2005, 3020, 'Gà rán 2 miếng', 35000, 'Gà rán giòn', TRUE),
      (2005, 3020, 'Xúc xích nướng', 25000, 'Xúc xích Đức', TRUE),
      (2005, 3017, 'Trà xanh Fuze Tea 450ml', 12000, 'Trà xanh chanh', TRUE)
    `);

    console.log("Adding products for Co.op Food...");
    await client.query(`
      INSERT INTO Foods (restaurant_id, category_id, name, price, description, is_available) VALUES
      (2006, 3021, 'Nước dừa Cocoxim 330ml', 18000, 'Nước dừa tươi', TRUE),
      (2006, 3021, 'Trà Ô Long Tea+ 500ml', 12000, 'Trà ô long không đường', TRUE),
      (2006, 3022, 'Cải thảo 500g', 20000, 'Cải thảo tươi', TRUE),
      (2006, 3022, 'Chuối tiêu 1kg', 22000, 'Chuối tiêu ngọt', TRUE),
      (2006, 3022, 'Ớt sừng 100g', 8000, 'Ớt tươi', TRUE),
      (2006, 3023, 'Gạo ST25 5kg', 180000, 'Gạo thơm ngon', TRUE),
      (2006, 3023, 'Dầu ăn Simply 1L', 42000, 'Dầu ăn cao cấp', TRUE),
      (2006, 3024, 'Nước mắm Nam Ngư 500ml', 35000, 'Nước mắm truyền thống', TRUE),
      (2006, 3024, 'Hạt nêm Knorr 400g', 28000, 'Hạt nêm thịt thăn', TRUE),
      (2006, 3021, 'Nước cam Vinamilk 1L', 28000, 'Nước cam ép 100%', TRUE)
    `);

    console.log("Setting opening hours to 24/7...");
    await client.query(`
      UPDATE Restaurants 
      SET opening_hours = '{"mon": "00:00-23:59", "tue": "00:00-23:59", "wed": "00:00-23:59", "thu": "00:00-23:59", "fri": "00:00-23:59", "sat": "00:00-23:59", "sun": "00:00-23:59"}'::jsonb
      WHERE restaurant_id BETWEEN 2001 AND 2006
    `);

    await client.query("COMMIT");

    // Verify
    const martCount = await client.query(
      "SELECT COUNT(*) FROM Restaurants WHERE restaurant_id BETWEEN 2001 AND 2006",
    );
    const catCount = await client.query(
      "SELECT COUNT(*) FROM Categories WHERE category_id BETWEEN 3001 AND 3024",
    );
    const foodCount = await client.query(
      "SELECT COUNT(*) FROM Foods WHERE restaurant_id BETWEEN 2001 AND 2006",
    );

    console.log("\n✅ SUCCESS!");
    console.log(`Mart stores added: ${martCount.rows[0].count}`);
    console.log(`Categories added: ${catCount.rows[0].count}`);
    console.log(`Products added: ${foodCount.rows[0].count}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error adding real mart stores:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addRealMartStores()
  .then(() => {
    console.log("\n🎉 All real mart stores added successfully!");
    console.log(
      "Stores: VinMart+, Circle K, GS25, FamilyMart, MiniStop, Co.op Food",
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error.message);
    process.exit(1);
  });
