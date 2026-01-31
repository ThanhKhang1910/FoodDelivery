const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "bronauto",
  password: process.env.DB_PASSWORD || "admin",
  port: process.env.DB_PORT || 5432,
});

async function addMartStores() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log("Adding mart store users...");
    await client.query(`
      INSERT INTO Users (user_id, full_name, email, phone_number, password_hash, role, status)
      VALUES
        (1001, 'Circle K Thảo Điền', 'circlek.thaodien@mart.com', '0901234567', '$2b$10$hashedpassword', 'RESTAURANT', 'ACTIVE'),
        (1002, 'FamilyMart Quận 1', 'familymart.q1@mart.com', '0901234568', '$2b$10$hashedpassword', 'RESTAURANT', 'ACTIVE'),
        (1003, 'MiniStop Bình Thạnh', 'ministop.binhthanh@mart.com', '0901234569', '$2b$10$hashedpassword', 'RESTAURANT', 'ACTIVE'),
        (1004, 'GS25 Phú Nhuận', 'gs25.phunhuan@mart.com', '0901234570', '$2b$10$hashedpassword', 'RESTAURANT', 'ACTIVE'),
        (1005, 'VinMart+ Tân Bình', 'vinmart.tanbinh@mart.com', '0901234571', '$2b$10$hashedpassword', 'RESTAURANT', 'ACTIVE')
      ON CONFLICT (user_id) DO NOTHING
    `);

    console.log("Adding mart restaurants...");
    await client.query(`
      INSERT INTO Restaurants (restaurant_id, shop_name, address, latitude, longitude, is_open, rating)
      VALUES
        (1001, 'Circle K Thảo Điền', '123 Xuân Thủy, Thảo Điền, Quận 2, TP.HCM', 10.8076, 106.7315, TRUE, 4.5),
        (1002, 'FamilyMart Quận 1', '456 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM', 10.7769, 106.7009, TRUE, 4.6),
        (1003, 'MiniStop Bình Thạnh', '789 Điện Biên Phủ, Phường 15, Bình Thạnh, TP.HCM', 10.8015, 106.7100, TRUE, 4.4),
        (1004, 'GS25 Phú Nhuận', '321 Phan Đăng Lưu, Phường 1, Phú Nhuận, TP.HCM', 10.7993, 106.6827, TRUE, 4.7),
        (1005, 'VinMart+ Tân Bình', '654 Cộng Hòa, Phường 13, Tân Bình, TP.HCM', 10.7992, 106.6437, TRUE, 4.8)
      ON CONFLICT (restaurant_id) DO NOTHING
    `);

    console.log("Adding categories...");
    await client.query(`
      INSERT INTO Categories (category_id, restaurant_id, name)
      VALUES
        (2001, 1001, 'Đồ uống'), (2002, 1001, 'Snack & Bánh kẹo'), (2003, 1001, 'Thực phẩm tươi sống'), (2004, 1001, 'Đồ dùng cá nhân'),
        (2005, 1002, 'Đồ uống'), (2006, 1002, 'Snack & Bánh kẹo'), (2007, 1002, 'Thực phẩm chế biến'), (2008, 1002, 'Sản phẩm tiện lợi'),
        (2009, 1003, 'Đồ uống'), (2010, 1003, 'Kem & Sữa chua'), (2011, 1003, 'Bánh mì & Sandwich'), (2012, 1003, 'Đồ ăn nhanh'),
        (2013, 1004, 'Đồ uống'), (2014, 1004, 'Snack Hàn Quốc'), (2015, 1004, 'Mỳ gói & Cơm hộp'), (2016, 1004, 'Sản phẩm làm đẹp'),
        (2017, 1005, 'Đồ uống'), (2018, 1005, 'Rau củ quả'), (2019, 1005, 'Thực phẩm đóng gói'), (2020, 1005, 'Đồ gia dụng')
      ON CONFLICT (category_id) DO NOTHING
    `);

    console.log("Adding products...");
    // Circle K products
    await client.query(`
      INSERT INTO Foods (restaurant_id, category_id, name, price, description, is_available) VALUES
      (1001, 2001, 'Coca Cola 330ml', 12000, 'Nước ngọt có ga Coca Cola lon 330ml', TRUE),
      (1001, 2001, 'Pepsi 330ml', 12000, 'Nước ngọt có ga Pepsi lon 330ml', TRUE),
      (1001, 2001, 'Nước suối Aquafina 500ml', 8000, 'Nước khoáng tinh khiết', TRUE),
      (1001, 2001, 'Trà xanh C2 455ml', 10000, 'Trà xanh không độ', TRUE),
      (1001, 2002, 'Snack Oishi Bí Đỏ 42g', 8000, 'Snack vị bí đỏ giòn tan', TRUE),
      (1001, 2002, 'Bánh Oreo 137g', 18000, 'Bánh quy kem socola', TRUE),
      (1001, 2002, 'Kẹo Mentos 37.5g', 12000, 'Kẹo nhai vị trái cây', TRUE),
      (1001, 2003, 'Sandwich Gà', 25000, 'Bánh mì sandwich nhân gà tươi', TRUE),
      (1001, 2003, 'Sushi Cá Hồi', 35000, 'Combo 6 miếng sushi cá hồi', TRUE),
      (1001, 2003, 'Salad Rau Củ', 28000, 'Salad rau củ tươi ngon', TRUE)
    `);

    // FamilyMart products
    await client.query(`
      INSERT INTO Foods (restaurant_id, category_id, name, price, description, is_available) VALUES
      (1002, 2005, 'Sting Dâu 330ml', 10000, 'Nước tăng lực vị dâu', TRUE),
      (1002, 2005, 'Sữa tươi TH True Milk 1L', 35000, 'Sữa tươi tiệt trùng', TRUE),
      (1002, 2005, 'Cà phê Highlands 235ml', 25000, 'Cà phê sữa đá lon', TRUE),
      (1002, 2006, 'Khoai tây Lays 52g', 15000, 'Snack khoai tây vị muối', TRUE),
      (1002, 2006, 'Pocky Chocolate 47g', 18000, 'Bánh que phủ socola', TRUE),
      (1002, 2006, 'Hạt điều rang muối 100g', 45000, 'Hạt điều rang muối thơm ngon', TRUE),
      (1002, 2007, 'Cơm hộp Gà Teriyaki', 38000, 'Cơm hộp gà sốt teriyaki', TRUE),
      (1002, 2007, 'Mì Ý Sốt Bò Bằm', 42000, 'Mì Ý sốt bò bằm đậm đà', TRUE),
      (1002, 2007, 'Bánh bao Nhân Thịt', 15000, 'Bánh bao nhân thịt hấp', TRUE),
      (1002, 2008, 'Khẩu trang y tế 10 cái', 25000, 'Khẩu trang y tế 4 lớp', TRUE)
    `);

    // MiniStop products
    await client.query(`
      INSERT INTO Foods (restaurant_id, category_id, name, price, description, is_available) VALUES
      (1003, 2009, 'Fanta Cam 330ml', 12000, 'Nước ngọt có ga vị cam', TRUE),
      (1003, 2009, 'Nước ép Twister 1L', 22000, 'Nước ép trái cây nhiệt đới', TRUE),
      (1003, 2009, 'Trà sữa Olong 500ml', 18000, 'Trà sữa olong đài loan', TRUE),
      (1003, 2010, 'Kem Cornetto 67ml', 15000, 'Kem ốc quế socola', TRUE),
      (1003, 2010, 'Kem Wall\\'s Magnum', 28000, 'Kem que socola cao cấp', TRUE),
      (1003, 2010, 'Sữa chua Vinamilk 100g', 8000, 'Sữa chua có đường', TRUE),
      (1003, 2011, 'Bánh mì Phô mai', 22000, 'Bánh mì nướng phô mai', TRUE),
      (1003, 2011, 'Sandwich Cá Ngừ', 28000, 'Sandwich nhân cá ngừ', TRUE),
      (1003, 2011, 'Hot Dog', 20000, 'Xúc xích kẹp bánh mì', TRUE),
      (1003, 2012, 'Gà rán 2 miếng', 35000, 'Gà rán giòn tan', TRUE)
    `);

    // GS25 products
    await client.query(`
      INSERT INTO Foods (restaurant_id, category_id, name, price, description, is_available) VALUES
      (1004, 2013, 'Milkis 250ml', 15000, 'Nước ngọt sữa Hàn Quốc', TRUE),
      (1004, 2013, 'Trà xanh Ô Long Tea 500ml', 16000, 'Trà xanh ô long Hàn Quốc', TRUE),
      (1004, 2013, 'Cà phê Maxim 100 gói', 85000, 'Cà phê hòa tan Hàn Quốc', TRUE),
      (1004, 2014, 'Snack Honey Butter Chip', 35000, 'Snack khoai tây mật ong bơ', TRUE),
      (1004, 2014, 'Bánh Choco Pie 360g', 42000, 'Bánh pie socola Hàn Quốc', TRUE),
      (1004, 2014, 'Kẹo dẻo Haribo 100g', 28000, 'Kẹo dẻo trái cây', TRUE),
      (1004, 2015, 'Mì Shin Ramyun', 18000, 'Mì cay Hàn Quốc', TRUE),
      (1004, 2015, 'Cơm cuộn Kimbap', 32000, 'Cơm cuộn rong biển Hàn Quốc', TRUE),
      (1004, 2015, 'Mì Jjapaguri (Chapaguri)', 25000, 'Mì đen Hàn Quốc', TRUE),
      (1004, 2016, 'Mặt nạ Mediheal 10 miếng', 120000, 'Mặt nạ dưỡng da Hàn Quốc', TRUE)
    `);

    // VinMart+ products
    await client.query(`
      INSERT INTO Foods (restaurant_id, category_id, name, price, description, is_available) VALUES
      (1005, 2017, 'Nước cam Vinamilk 1L', 28000, 'Nước cam ép 100%', TRUE),
      (1005, 2017, 'Trà Ô Long Tea+ 500ml', 12000, 'Trà ô long không đường', TRUE),
      (1005, 2017, 'Nước dừa Cocoxim 330ml', 18000, 'Nước dừa tươi nguyên chất', TRUE),
      (1005, 2018, 'Cà chua Đà Lạt 500g', 25000, 'Cà chua tươi Đà Lạt', TRUE),
      (1005, 2018, 'Xà lách Lô Lô 200g', 15000, 'Xà lách lô lô tươi', TRUE),
      (1005, 2018, 'Chuối tiêu 1kg', 22000, 'Chuối tiêu ngon ngọt', TRUE),
      (1005, 2019, 'Gạo ST25 5kg', 180000, 'Gạo ST25 thơm ngon', TRUE),
      (1005, 2019, 'Trứng gà VinEco 10 quả', 35000, 'Trứng gà sạch VinEco', TRUE),
      (1005, 2019, 'Dầu ăn Simply 1L', 42000, 'Dầu ăn cao cấp', TRUE),
      (1005, 2020, 'Giấy vệ sinh Pulppy 10 cuộn', 45000, 'Giấy vệ sinh mềm mại', TRUE)
    `);

    console.log("Updating opening hours...");
    await client.query(`
      UPDATE Restaurants 
      SET opening_hours = '{"mon": "00:00-23:59", "tue": "00:00-23:59", "wed": "00:00-23:59", "thu": "00:00-23:59", "fri": "00:00-23:59", "sat": "00:00-23:59", "sun": "00:00-23:59"}'::jsonb
      WHERE restaurant_id IN (1001, 1002, 1003, 1004, 1005)
    `);

    await client.query("COMMIT");

    // Verify
    const martCount = await client.query(
      "SELECT COUNT(*) FROM Restaurants WHERE restaurant_id BETWEEN 1001 AND 1005",
    );
    const catCount = await client.query(
      "SELECT COUNT(*) FROM Categories WHERE category_id BETWEEN 2001 AND 2020",
    );
    const foodCount = await client.query(
      "SELECT COUNT(*) FROM Foods WHERE restaurant_id BETWEEN 1001 AND 1005",
    );

    console.log("\n✅ SUCCESS!");
    console.log(`Mart stores added: ${martCount.rows[0].count}`);
    console.log(`Categories added: ${catCount.rows[0].count}`);
    console.log(`Products added: ${foodCount.rows[0].count}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error adding mart stores:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addMartStores()
  .then(() => {
    console.log("\n🎉 All mart stores and products added successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed to add mart stores:", error.message);
    process.exit(1);
  });
