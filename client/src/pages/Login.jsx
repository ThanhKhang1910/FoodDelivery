import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axiosClient from "../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Email không hợp lệ")
        .required("Vui lòng nhập email"),
      password: Yup.string().required("Vui lòng nhập mật khẩu"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const res = await axiosClient.post("/auth/login", values);
        // Use AuthContext login
        login(res.data.user, res.data.token);
        navigate("/"); // Redirect to Home
      } catch (error) {
        setErrors({
          general: error.response?.data?.message || "Đăng nhập thất bại",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-blue/5 flex items-center justify-center p-4">
      {/* Animated Background Gradient */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-blue/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow animation-delay-300"></div>

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Card */}
        <div className="card-premium p-8 md:p-10">
          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-glow">
              🚀
            </div>
            <h1 className="text-3xl font-display font-black text-gray-900 mb-2">
              Chào mừng trở lại!
            </h1>
            <p className="text-gray-500 font-medium">Đăng nhập để tiếp tục</p>
          </div>

          {/* Error Message */}
          {formik.errors.general && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-2xl animate-slide-down">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-red-700 font-medium text-sm">
                  {formik.errors.general}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="input-floating-group">
              <input
                type="email"
                name="email"
                placeholder=" "
                className={`input-floating peer ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              <label className="label-floating">📧 Email</label>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs mt-2 ml-1 animate-fade-in">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="input-floating-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder=" "
                className={`input-floating peer ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              <label className="label-floating">🔒 Mật khẩu</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-2 ml-1 animate-fade-in">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-bold hover:underline transition"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="btn-secondary py-3 flex items-center justify-center gap-2">
              <span className="text-xl">🔵</span>
              <span className="font-bold">Facebook</span>
            </button>
            <button className="btn-secondary py-3 flex items-center justify-center gap-2">
              <span className="text-xl">🔴</span>
              <span className="font-bold">Google</span>
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center mt-8 text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-primary-600 font-black hover:text-primary-700 hover:underline transition"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
