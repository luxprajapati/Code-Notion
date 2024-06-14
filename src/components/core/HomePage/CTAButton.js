import React from "react";
import { NavLink } from "react-router-dom";

const CTAButton = ({ children, active, linkto }) => {
  return (
    <NavLink to={linkto}>
      <div
        className={`text-center capitalize text-[13px] sm:text-[16px] px-6 py-3 rounded-md font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)]
          ${active ? "bg-yellow-50 text-black" : "bg-richblack-800 text-richblack-5"}
          hover:scale-95 transition-all duration-200 hover:shadow-none
        `}
      >
        {children}
      </div>
    </NavLink>
  );
};

export default CTAButton;
