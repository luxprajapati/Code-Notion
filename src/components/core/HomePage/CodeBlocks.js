import React from "react";
import CTAButton from "./CTAButton";
import { FaArrowRight } from "react-icons/fa";
import { TypeAnimation } from "react-type-animation";
import "./border.css";

const CodeBlocks = ({
  position,
  heading,
  subheading,
  ctabnt1,
  ctabnt2,
  codeblock,
  backgroundGradient,
  codeColor,
}) => {
  return (
    <div
      className={`flex ${position} my-20 justify-between items-center gap-10`}
    >
      {/* Section 1 */}
      <div className="w-[100%] lg:w-[50%] flex flex-col gap-8">
        {heading}
        <div className="text-richblack-300 text-base w-[85%] -mt-3  font-bold ">
          {subheading}
        </div>
        {/* Buttons */}
        <div className="flex gap-7 mt-7">
          <CTAButton active={ctabnt1.active} linkto={ctabnt1.linkto}>
            <div className="flex gap-2 items-center">
              {ctabnt1.btnText}
              <FaArrowRight />
            </div>
          </CTAButton>

          <CTAButton active={ctabnt2.active} linkto={ctabnt2.linkto}>
            {ctabnt2.btnText}
          </CTAButton>
        </div>
      </div>
      {/* Section 2 */}
      <div className="h-fit relative w-[100%] code-border flex flex-row py-3 text-[10px] sm:text-sm leading-[18px] sm:leading-6  lg:w-[470px]">
        {/*bg Gradient */}
        <div
          className={`absolute w-[373px] h-[257px] rounded-full blur-2xl opacity-20 -left-2 -top-2  ${backgroundGradient ? "gradient-css-1" : "gradient-css-2"} `}
        ></div>
        {/* Numbering */}
        <div
          className="text-center flex select-none flex-col w-[10%]
         text-richblack-400 font-inter font-bold"
        >
          {Array.from({ length: 11 }, (_, index) => (
            <p key={index}>{index + 1}</p>
          ))}
        </div>
        {/* Code animation */}
        <div
          className={`w-[90%] flex flex-col gap-2 font-bold font-mono ${codeColor} pr-1`}
        >
          <TypeAnimation
            sequence={[codeblock, 2000, ""]}
            repeat={Infinity}
            cursor={true}
            style={{
              whiteSpace: "pre-line",
              display: "block",
            }}
            omitDeletionAnimation={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeBlocks;
