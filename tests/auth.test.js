const request = require("supertest");
const express = require("express");
const authRoutes = require("../src/routes/authRoutes");
const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRoutes);

// Mock DB interactions for unit tests
// For integration tests, we would use a real test DB
jest.mock("../src/models/userModel", () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
}));

const User = require("../src/models/userModel");
const bcrypt = require("bcrypt");

describe("Auth API", () => {
  it("POST /register - should register a new user", async () => {
    User.findByEmail.mockResolvedValue(null);
    User.create.mockResolvedValue({
      user_id: 1,
      full_name: "Test User",
      email: "test@example.com",
      role: "CUSTOMER",
    });

    const res = await request(app).post("/api/v1/auth/register").send({
      fullName: "Test User",
      email: "test@example.com",
      password: "password123",
      phone: "0901234567",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toEqual("test@example.com");
  });

  it("POST /login - should login user and return token", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    User.findByEmail.mockResolvedValue({
      user_id: 1,
      email: "test@example.com",
      password_hash: hashedPassword,
      role: "CUSTOMER",
      full_name: "Test User",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});
