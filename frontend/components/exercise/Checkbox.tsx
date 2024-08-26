import React from "react";

interface CheckboxProps {
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ className = "" }) => {
  return (
    <div
      className={`flex h-[16px] w-[16px] items-center justify-center ${className}`}
    >
      <svg
        width="9"
        height="10"
        viewBox="0 0 9 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.70712 0.792893C1.3166 0.402369 0.683433 0.402369 0.292909 0.792893C-0.0976157 1.18342 -0.0976157 1.81658 0.292909 2.20711L3.08582 5.00002L0.292894 7.79294C-0.0976312 8.18346 -0.0976312 8.81663 0.292894 9.20715C0.683418 9.59768 1.31658 9.59768 1.70711 9.20715L4.50003 6.41423L7.29291 9.20711C7.68343 9.59763 8.3166 9.59763 8.70712 9.20711C9.09765 8.81658 9.09765 8.18342 8.70712 7.79289L5.91424 5.00002L8.70711 2.20715C9.09763 1.81663 9.09763 1.18346 8.70711 0.79294C8.31658 0.402416 7.68342 0.402416 7.29289 0.79294L4.50003 3.5858L1.70712 0.792893Z"
          fill="#5B5B5B"
        />
      </svg>
    </div>
  );
};

export default Checkbox;
