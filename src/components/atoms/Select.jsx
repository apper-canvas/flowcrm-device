import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Select = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

export default Select;