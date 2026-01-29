import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axiosClient from "../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      full_name: Yup.string().required("Vui lòng nhập họ tên"),
      email: Yup.string()
        .email("Email không hợp lệ")
        .required("Vui lòng nhập email"),
      phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số")
        .required("Vui lòng nhập số điện thoại"),
      password: Yup.string()
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .required("Vui lòng nhập mật khẩu"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Mật khẩu không khớp")
        .required("Vui lòng xác nhận mật khẩu"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const { confirmPassword, ...registerData } = values;
        const res = await axiosClient.post("/auth/register", registerData);
        // Use AuthContext login for auto-login after registration
        login(res.data.user, res.data.token);
        navigate("/");
      } catch (error) {
        setErrors({
          general: error.response?.data?.message || "Đăng ký thất bại",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2)
      return { strength: 33, label: "Yếu", color: "bg-red-500" };
    if (strength <= 3)
      return { strength: 66, label: "Trung bình", color: "bg-yellow-500" };
    return { strength: 100, label: "Mạnh", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formik.values.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-blue/5 flex items-center justify-center p-4 py-12">
      {/* Animated Background Gradient */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-blue/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow animation-delay-300"></div>

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Card */}
        <div className="card-premium p-8 md:p-10">
          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-glow">
              ✨
            </div>
            <h1 className="text-3xl font-display font-black text-gray-900 mb-2">
              Tạo tài khoản mới
            </h1>
            <p className="text-gray-500 font-medium">
              Tham gia cùng chúng tôi ngay hôm nay
            </p>
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
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div className="input-floating-group">
              <input
                type="text"
                name="full_name"
                placeholder=" "
                className={`input-floating peer ${
                  formik.touched.full_name && formik.errors.full_name
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.full_name}
              />
              <label className="label-floating">👤 Họ và tên</label>
              {formik.touched.full_name && formik.errors.full_name && (
                <p className="text-red-500 text-xs mt-2 ml-1 animate-fade-in">
                  {formik.errors.full_name}
                </p>
              )}
            </div>

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

            {/* Phone Input */}
            <div className="input-floating-group">
              <input
                type="tel"
                name="phone"
                placeholder=" "
                className={`input-floating peer ${
                  formik.touched.phone && formik.errors.phone
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phone}
              />
              <label className="label-floating">📱 Số điện thoại</label>
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-500 text-xs mt-2 ml-1 animate-fade-in">
                  {formik.errors.phone}
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
              {/* Password Strength Indicator */}
              {formik.values.password && (
                <div className="mt-3 animate-fade-in">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 font-medium">
                      Độ mạnh mật khẩu
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        passwordStrength.strength === 100
                          ? "text-green-600"
                          : passwordStrength.strength === 66
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="input-floating-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder=" "
                className={`input-floating peer ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
              />
              <label className="label-floating">🔐 Xác nhận mật khẩu</label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-2 ml-1 animate-fade-in">
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {formik.isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang đăng ký...
                </span>
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-primary-600 font-black hover:text-primary-700 hover:underline transition"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
