import React from "react";
import { NavLink } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import HighlightText from "../components/core/HomePage/HighlightText";
import CTAButton from "../components/core/HomePage/CTAButton";
import Banner from "../assets/Images/banner.mp4";
import CodeBlocks from "../components/core/HomePage/CodeBlocks";
import TimelineSection from "../components/core/HomePage/TimelineSection";
import LearningLanguageSection from "../components/core/HomePage/LearningLanguageSection";
import InstructorSection from "../components/core/HomePage/InstructorSection";
import ReviewSlider from "../components/common/ReviewSlider";
import Footer from "../components/common/Footer";
import ExploreMore from "../components/core/HomePage/ExploreMore";

const Home = () => {
  return (
    <div>
      {/* Section 1 */}
      <div className="relative mx-auto flex flex-col w-11/12 items-center text-white justify-between max-w-maxContent">
        {/* Top Button */}
        <NavLink to="/signup">
          <div
            className="group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200
            transition-all duration-200 drop-shadow-[0_1.5px_rgba(255,255,255,0.25)] hover:scale-95 w-fit hover:drop-shadow-none"
          >
            <div
              className="flex flex-row items-center gap-2 rounded-full px-10 py-[5px]
                    transition-all duration-200 group-hover:bg-richblack-900"
            >
              <p className="capitalize">Become an Instructor</p>
              <FaArrowRight />
            </div>
          </div>
        </NavLink>
        {/* Heading */}
        <div className="capitalize text-center text-4xl font-semibold mt-7">
          Empower your future with
          <HighlightText text={"Coding Skills"}></HighlightText>
        </div>
        {/* Intro */}
        <div className="text-center mt-4 w-[90%] text-lg font-bold text-richblack-300">
          With our online coding courses, you can learn at your own pace, from
          anywhere in the world, and get access to a wealth of resources,
          including hands-on projects, quizzes, and personalized feedback from
          instructors.
        </div>
        {/* Buttons */}
        <div className="flex flex-row gap-7 mt-8">
          <CTAButton active={true} linkto={"/signup"}>
            Learn More
          </CTAButton>
          <CTAButton active={false} linkto={"/login"}>
            Book a Demo
          </CTAButton>
        </div>
        {/* Video */}
        <div className="mx-3 my-14 shadow-[10px_-5px_50px_-5px] shadow-blue-200 ">
          <video
            muted
            loop
            autoPlay
            className="shadow-[20px_20px_rgba(255,255,255)]"
          >
            <source src={Banner} type="video/mp4"></source>
          </video>
        </div>
        {/* Codeblocks 1 */}
        <div>
          <CodeBlocks
            position={" flex-col lg:flex-row"}
            heading={
              <div className="text-4xl font-semibold">
                Unlock Your
                <HighlightText text={"Coding Potential "} />
                with online courses
              </div>
            }
            backgroundGradient={true}
            subheading={
              "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
            }
            ctabnt1={{
              active: true,
              linkto: "/signup",
              btnText: "Try it yourself",
            }}
            ctabnt2={{
              active: false,
              linkto: "/login",
              btnText: "Learn More",
            }}
            codeblock={`<!DOCTYPE html>\n<html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">LUX PRAJAPATI</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
            codeColor={"text-yellow-25"}
          ></CodeBlocks>
        </div>
        {/* codeblocks 2 */}
        <div>
          <CodeBlocks
            position={"flex-col lg:flex-row-reverse"}
            heading={
              <div className="w-[100%] text-4xl font-semibold lg:w-[50%]">
                Start
                <HighlightText text={"Coding in seconds"} />
              </div>
            }
            subheading={
              "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
            }
            ctabnt1={{
              active: true,
              linkto: "/signup",
              btnText: "Continue Lessons",
            }}
            ctabnt2={{
              active: false,
              linkto: "/login",
              btnText: "Learn More",
            }}
            backgroundGradient={false}
            codeblock={`import React from "react";\nimport CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>LUX PRAJAPATI</div>\n)\n}\nexport default Home;`}
            codeColor={"text-blue-25"}
          ></CodeBlocks>
        </div>
        {/* explore more */}
        <ExploreMore />
      </div>

      {/* Section 2 */}
      <div className="bg-pure-greys-5 text-richblack-700">
        {/* button and criss-cross background */}
        <div className="homepage_bg h-[310px]">
          <div className="w-11/12 max-w-maxContent flex flex-col  items-center justify-between gap-5 mx-auto">
            <div className="hidden lg:block h-[180px]"></div>
            {/* buttons */}
            <div className="mt-8 lg:mt-0 flex flex-row gap-7 text-white">
              <CTAButton active={true} linkto={"/signup"}>
                <div className="flex items-center gap-3">
                  Explore Full Catalog
                  <FaArrowRight />
                </div>
              </CTAButton>
              <CTAButton active={false} linkto={"/signup"}>
                Learn More
              </CTAButton>
            </div>
          </div>
        </div>
        {/* header, timeline, learning */}
        <div className="w-11/12 mx-auto max-w-maxContent flex flex-col items-center justify-center gap-7">
          <div className="flex flex-col lg:flex-row justify-between gap-5 mb-10 -mt-20 lg:mt-[95px]">
            {/* header leftside */}
            <div className="text-4xl font-semibold lg:w-[45%] ">
              Get the Skills you need for a{" "}
              <HighlightText text={"Job that is in demand."}></HighlightText>
            </div>
            {/* header rightside */}
            <div className="flex flex-col gap-10 lg:w-[40%] items-start">
              <div className="text-[16px]">
                The modern CodeNotion is the dictates its own terms. Today, to
                be a competitive specialist requires more than professional
                skills.
              </div>
              <CTAButton active={true} linkto={"/signup"}>
                Learn more
              </CTAButton>
            </div>
          </div>

          {/* Timeline section */}
          <TimelineSection />
          {/* Learning language section */}
          <LearningLanguageSection />
        </div>
      </div>

      {/* Section 3 */}
      <div className=" bg-richblack-900 w-11/12 mx-auto max-w-maxContent flex flex-col items-center justify-between gap-8 text-white mb-10">
        {/* Instructor Section */}
        <InstructorSection />

        {/* <div className="hidden lg:block"> */}
        <h2 className="text-center text-4xl font-semibold mt-10  ">
          Reviews from other learners
        </h2>
        {/* <div className="w-11/12 mx-auto "> */}
        {/* Reviews slider section */}
        <ReviewSlider />
        {/* </div> */}
        {/* </div> */}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
