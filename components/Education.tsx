import React from "react";
import { TextRevealCard } from "./ui/TextRevealCard";
import { HoverEffect } from "./ui/HoverCardEffect";
import { FaUserGraduate } from "react-icons/fa";
import { PiExamFill } from "react-icons/pi";
import { SiCoursera } from "react-icons/si";

const Education = () => {
  const educations = [
    {
      title: "Graduation",
      major: "Department of CSE",
      institute: "Port City International University",
      icon: <FaUserGraduate className="text-lg text-blue-400" />,
      link: "https://www.portcity.edu.bd/",
    },
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

    {
      title: "Higher Secondary",
      major: "Science",
      institute: "Hazera Taju University College",
      icon: <PiExamFill className="text-lg text-blue-400" />,
      link: "https://www.htdc.edu.bd/",
    },
  ];
  return (
    <div className="my-10">
      <TextRevealCard
        text="Education Courses and Recognition"
        revealText="Recognition Courses and Education "
      />
      <div>
        <div className="w-full mx-auto">
          <HoverEffect items={educations} />
        </div>
      </div>
    </div>
  );
};

export default Education;
