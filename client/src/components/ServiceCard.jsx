import React from "react";

const ServiceCard = ({ title, icon, color, onClick, isSelected }) => {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer 
        p-6 
        rounded-2xl 
        shadow-sm 
        transition-all 
        duration-300 
        transform 
        hover:-translate-y-1 
        hover:shadow-md
        flex 
        flex-col 
        items-center 
        justify-center 
        gap-3
        border
        ${isSelected ? "border-primary bg-green-50 ring-2 ring-primary ring-opacity-50" : "border-gray-100 bg-white hover:border-gray-200"}
      `}
    >
      <div
        className={`
        w-16 h-16 
        rounded-full 
        flex items-center justify-center 
        text-3xl 
        shadow-inner
        ${color}
      `}
      >
        {icon}
      </div>
      <span
        className={`font-bold text-lg ${isSelected ? "text-primary" : "text-gray-700"}`}
      >
        {title}
      </span>
    </div>
  );
};

export default ServiceCard;
