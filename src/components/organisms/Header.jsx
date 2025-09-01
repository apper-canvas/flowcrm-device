import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ onMenuClick, title, action }) => {
  return (
    <header className="bg-white border-b border-gray-200 lg:pl-72">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="lg:hidden p-2 mr-4"
              onClick={onMenuClick}
            >
              <ApperIcon name="Menu" className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          {action && (
            <div>{action}</div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;