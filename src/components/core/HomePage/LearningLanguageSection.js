import React from "react";
import HighlightText from "../HomePage/HighlightText";
import Know_your_progress from "../../../assets/Images/Know_your_progress.png";
import Compare_with_others from "../../../assets/Images/Compare_with_others.png";
import Plan_your_lessons from "../../../assets/Images/Plan_your_lessons.png";
import CTAButton from "../HomePage/CTAButton";
const LearningLanguageSection = () => {
  return (
    <div className="mt-16 mb-20">
      <div className="flex flex-col items-center gap-5">
        {/* Heading */}
        <div className="text-4xl font-semibold text-center">
          Your swiss knife for
          <HighlightText text="learning any languages" />
        </div>
        {/* Sub heading */}
        <div className="text-center text-richblack-600 mx-auto text-base font-medium w-[70%]">
          Using spin making learning multiple languages easy. with 20+ languages
          realistic voice-over, progress tracking, custom schedule and more.
        </div>
        {/* Images */}
        <div className="flex flex-col lg:flex-row items-center justify-center mt-5">
          <img
            src={Know_your_progress}
            alt="Know_your_progress_Img"
            className="object-contain lg:mt-0  lg:-mr-32"
          ></img>
          <img
            src={Compare_with_others}
            alt="Compare_with_other_Img"
            className="object-contain lg:mt-0 -mt-10"
          ></img>
          <img
            src={Plan_your_lessons}
            alt="Plan_your_lesson_Img"
            className="object-contain lg:mt-0 -mt-14 lg:-ml-36"
          ></img>
        </div>
        {/* Button */}
        <div className="w-fit">
          <CTAButton active={true} linkto={"/signup"}>
            Learn more
          </CTAButton>
        </div>
      </div>
    </div>
  );
};

export default LearningLanguageSection;
