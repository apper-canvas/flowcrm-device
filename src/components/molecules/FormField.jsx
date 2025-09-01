import React from "react";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  error, 
  required = false, 
  options = [], 
  placeholder = "",
  className = ""
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {type === "select" ? (
        <Select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;