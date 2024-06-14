import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";
import Spinner from "../../../components/common/Spinner";
import ProgressBar from "@ramonak/react-progress-bar";
import { useNavigate } from "react-router-dom";
import convertSecondsToDuration from "../../../utils/secToDurationFrontend";

const EnrolledCourses = () => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState(null);

  const getEnrolledCourses = async () => {
    try {
      const response = await getUserEnrolledCourses(token);
      setEnrolledCourses(response);
    } catch (error) {
      console.log("GET_ENROLLED_COURSES ERROR............", error);
    }
  };

  useEffect(() => {
    getEnrolledCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // console.log("Enrolled Courses: -", enrolledCourses);

  function getDuration(course) {
    let totalDurationInSeconds = 0;
    course.courseContent.forEach((content) => {
      content.subsections.forEach((subsection) => {
        const timeDurationInSeconds = parseInt(subsection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });
    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);
    return totalDuration;
  }

  return (
    <>
      <div className="text-3xl text-richblack-50">Enrolled Courses</div>
      {!enrolledCourses ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <Spinner />
        </div>
      ) : !enrolledCourses.length ? (
        <div className="grid h-[10vh] w-full place-content-center text-richblack-5">
          You've not Enrolled in Course!
        </div>
      ) : (
        <div className="my-8 text-richblack-5">
          {/* Heading */}
          <div className="flex rounded-t-lg bg-richblack-500">
            <p className="w-[45%] px-5 py-3">Course Name</p>
            <p className="w-1/4 px-2 py-3">Duration</p>
            <p className="flex-1 px-2 py-3">Progress</p>
          </div>
          {/* Course Names */}
          {enrolledCourses.map((course, index, arr) => (
            <div
              className={`flex item-center border border-richblack-700 ${index === arr.length - 1 ? "rounded-b-lg" : "rounded-none"}`}
              key={index}
            >
              <div
                className={`flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3`}
                onClick={() =>
                  // pending
                  navigate(
                    `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subsections?.[0]?._id}`
                  )
                }
              >
                <img
                  src={course.thumbnail}
                  alt="course-thumbnail"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex max-w-xs flex-col gap-2">
                  <p className="font-semibold">{course.courseName}</p>
                  <p className="text-xs text-richblack-300">
                    {course.courseDescription.length > 50
                      ? `${course.courseDescription.slice(0, 50)}...`
                      : course.courseDescription}
                  </p>
                </div>
              </div>

              {/* <div className="w-1/4 px-2 py-3">{course?.courseContent?.subsections?.timeDuration}</div> */}

              <div className="w-1/4 px-2 py-3">{getDuration(course)}</div>
              <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                <p>Progress: {course.progressPercentage || 0}%</p>
                <ProgressBar
                  completed={course.progressPercentage || 0}
                  height="8px"
                  isLabelVisible={false}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default EnrolledCourses;
