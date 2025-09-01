import React, { useContext } from "react";
import { useSelector } from 'react-redux';
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { AuthContext } from "../../App";

const Header = ({ onMenuClick, title, action }) => {
  const { logout } = useContext(AuthContext);
  const { user, isAuthenticated } = useSelector((state) => state.user);
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
          <div className="flex items-center space-x-4">
            {action && (
              <div>{action}</div>
            )}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-gray-500">{user.emailAddress}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ApperIcon name="LogOut" className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;