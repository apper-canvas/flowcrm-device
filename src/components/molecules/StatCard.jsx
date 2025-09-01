import React from "react";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ title, value, icon, trend, trendValue, color = "primary" }) => {
  const colors = {
    primary: "from-primary-500 to-primary-600",
    secondary: "from-secondary-500 to-secondary-600",
    accent: "from-accent-500 to-accent-600",
    warning: "from-yellow-500 to-yellow-600"
  };

  return (
    <div className="card-gradient p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}>
              <ApperIcon 
                name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                className="h-4 w-4 mr-1" 
              />
              {trendValue}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${colors[color]} rounded-lg flex items-center justify-center`}>
          <ApperIcon name={icon} className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;