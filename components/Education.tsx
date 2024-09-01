"use client";

import React, { useState } from "react";
import { TextRevealCard } from "./ui/TextRevealCard";
import { HoverEffect } from "./ui/HoverCardEffect";
import { FaUserGraduate } from "react-icons/fa";
import { PiExamFill } from "react-icons/pi";
import { SiCoursera } from "react-icons/si";

const Education = () => {
  const [eduType, setEduType] = useState("academic");
  const academicEducations = [
    {
      title: "Graduation",
      major: "Department of CSE",
      institute: "Port City International University",
      icon: <FaUserGraduate className="text-lg text-blue-400" />,
      link: "https://www.portcity.edu.bd/",
    },

    {
      title: "Higher Secondary",
      major: "Science",
      institute: "Hazera Taju University College",
      icon: <PiExamFill className="text-lg text-blue-400" />,
      link: "https://www.htdc.edu.bd/",
    },
  ];

  const courseEducation = [
    {
      title: "Phitron",
      major: "Software Engineer",
      institute: "Programming Hero",
      icon: <SiCoursera className="text-lg text-blue-400" />,
      link: "https://www.programming-hero.com/",
    },
    {
      title: "Apollo Wev Development- Level 2",
      major: "Full Stack Developer",
      institute: "Programming Hero",
      icon: <SiCoursera className="text-lg text-blue-400" />,
      link: "https://www.programming-hero.com/",
    },
    {
      title: "Complete Web development with Jhankar Mahbub",
      major: "Mern Stack Developer",
      institute: "Programming Hero",
      icon: <SiCoursera className="text-lg text-blue-400" />,
      link: "https://www.programming-hero.com/",
    },
  ];

  return (
    <div className="my-16">
      {/* <TextRevealCard
        text="Education Courses and Recognition"
        revealText="Recognition Courses and Education "
      /> */}
      {/* <div className="flex justify-center mb-3">
        <h1 className="text-base md:text-lg lg:text-xl text-blue-200 font-bold tracking-widest">
          Education and Courses
        </h1>
      </div> */}

      {/* tab */}
      <div className="my-3 flex">
        <div className="flex flex-col gap-y-3">
          <span
            onClick={() => {
              setEduType("academic");
            }}
            className={`${
              eduType == "academic" && " border-l-4 border-red-600 bg-slate-900"
            } cursor-pointer px-5 py-1 rounded`}
          >
            Academic
          </span>
          <span
            onClick={() => {
              setEduType("course");
            }}
            className={`${
              eduType == "course" && " border-l-4 border-red-600 bg-slate-900"
            } cursor-pointer px-5 py-1 rounded`}
          >
            Courses
          </span>
        </div>
      </div>
      <div>
        {eduType == "academic" ? (
          <div className="w-full mx-auto">
            <HoverEffect items={academicEducations} />
          </div>
        ) : (
          <div className="w-full mx-auto">
            <HoverEffect items={courseEducation} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;
