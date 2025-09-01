import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const navigation = [
  { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { name: "Contacts", href: "/contacts", icon: "Users" },
  { name: "Deals", href: "/deals", icon: "TrendingUp" },
  { name: "Activities", href: "/activities", icon: "Calendar" },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Zap" className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                FlowCRM
              </h1>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-semibold transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-600 shadow-sm"
                              : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                          }`
                        }
                      >
                        <ApperIcon name={item.icon} className="h-5 w-5 shrink-0" />
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
              <div className="flex h-16 shrink-0 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Zap" className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    FlowCRM
                  </h1>
                </div>
                <button
                  type="button"
                  className="p-2 text-gray-700 hover:text-gray-900"
                  onClick={onClose}
                >
                  <ApperIcon name="X" className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <NavLink
                            to={item.href}
                            className={({ isActive }) =>
                              `group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-semibold transition-all duration-200 ${
                                isActive
                                  ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-600 shadow-sm"
                                  : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                              }`
                            }
                            onClick={onClose}
                          >
                            <ApperIcon name={item.icon} className="h-5 w-5 shrink-0" />
                            {item.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;