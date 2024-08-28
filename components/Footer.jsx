import React from "react";
import { FaLocationDot } from "react-icons/fa6";

const Footer = () => {
  return (
    <div className="w-full h-28 flex items-center justify-center text-blue-200  py-10">
      <div className="w-full">
        <div className="w-full h-full flex justify-center py-2">
          <p>&#x24B8; Anik Chandra Dev</p>
        </div>
        <div className="flex justify-center">
          <div className="flex items-center gap-5 px-5">
            <FaLocationDot />
            <p className="px-3 text-center">Chattogram, Bangladesh</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
