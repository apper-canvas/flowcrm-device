import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  icon = "Database", 
  title = "No data found", 
  description = "Get started by creating your first item.", 
  actionText = "Create New",
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name={icon} className="h-8 w-8 text-primary-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">{description}</p>
      {onAction && (
        <Button onClick={onAction} className="flex items-center space-x-2">
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>{actionText}</span>
        </Button>
      )}
    </div>
  );
};

export default Empty;