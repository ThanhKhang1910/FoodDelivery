import React, { useEffect, useState } from "react";

const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          return 0;
        }
        return prev - (100 / duration) * 50;
      });
    }, 50);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-success",
          icon: "✓",
          progressBg: "bg-green-300",
        };
      case "error":
        return {
          bg: "bg-error",
          icon: "✕",
          progressBg: "bg-red-300",
        };
      case "warning":
        return {
          bg: "bg-warning",
          icon: "⚠",
          progressBg: "bg-yellow-300",
        };
      case "info":
        return {
          bg: "bg-info",
          icon: "ℹ",
          progressBg: "bg-blue-300",
        };
      default:
        return {
          bg: "bg-gray-800",
          icon: "•",
          progressBg: "bg-gray-600",
        };
    }
  };

  const styles = getToastStyles();

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] ${
        isVisible ? "animate-slide-left" : "animate-fade-out"
      }`}
    >
      <div
        className={`${styles.bg} text-white px-6 py-4 rounded-2xl shadow-hard min-w-[300px] max-w-md`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
            {styles.icon}
          </div>
          <p className="font-medium flex-1">{message}</p>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose && onClose(), 300);
            }}
            className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition flex-shrink-0"
          >
            ✕
          </button>
        </div>
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full ${styles.progressBg} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Custom Hook for Toast
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (message, duration) => addToast(message, "success", duration),
    error: (message, duration) => addToast(message, "error", duration),
    warning: (message, duration) => addToast(message, "warning", duration),
    info: (message, duration) => addToast(message, "info", duration),
  };
};

export default Toast;
