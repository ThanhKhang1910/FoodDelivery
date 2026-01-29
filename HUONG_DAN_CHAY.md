# Hướng Dẫn Chạy Ứng Dụng Food Delivery System

Dưới đây là các bước để cài đặt và chạy ứng dụng này trên máy của bạn.

## 1. Yêu cầu hệ thống

- **Node.js**: Phiên bản 14 trở lên.
- **PostgreSQL**: Cơ sở dữ liệu.
- **Git**.

## 2. Cấu hình Cơ sở dữ liệu (Database)

1. Mở công cụ quản lý PostgreSQL (pgAdmin hoặc DBeaver).
2. Tạo một database mới (ví dụ: `food_ordering_db`).
3. Chạy file script `database_schema.sql` (nằm ở thư mục gốc) để tạo bảng.
4. Mở file `.env` ở thư mục gốc dự án và cập nhật thông tin kết nối:
   ```env
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=mat_khau_cua_ban
   DB_NAME=food_ordering_db
   ```

## 3. Chạy Backend (Server)

1. Mở cửa sổ terminal (cmd/powershell) tại thư mục gốc của dự án.
2. Cài đặt thư viện (nếu chưa):
   ```bash
   npm install
   ```
3. Khởi động server:
   ```bash
   npm run dev
   ```
   Server sẽ chạy tại `http://localhost:5000`.

## 4. Chạy Frontend (Client)

1. Mở một cửa sổ terminal **mới**.
2. Di chuyển vào thư mục client:
   ```bash
   cd client
   ```
3. Cài đặt thư viện (tôi đang chạy lệnh này cho bạn):
   ```bash
   npm install
   ```
4. Khởi động ứng dụng React:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt và truy cập địa chỉ hiển thị (thường là `http://localhost:5173`).

## Ghi chú

- Nếu gặp lỗi, hãy kiểm tra xem Backend đã chạy chưa.
- Đảm bảo database đã được kết nối đúng trong `.env`.
