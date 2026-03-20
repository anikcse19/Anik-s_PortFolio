import React from "react";
import { CardSpotlight } from "./ui/CardSpotlight";
import { FaLocationArrow } from "react-icons/fa";

interface Experience {
  company: string;
  location: string;
  position: string;
  employmentType: string;
  duration: string;
  responsibilities: string[];
}

const experiences: Experience[] = [
  {
    company: "RexVet",
    location: "US",
    position: "Full Stack Developer",
    employmentType: "Remote",
    duration: "April 2025 – Present",
    responsibilities: [
      "Leading the frontend team in building modern, scalable, and accessible digital products using Next.js and TypeScript, ensuring high performance and seamless user experiences across devices. ",
      "Architecting component libraries and establishing design systems to maintain consistency across multiple products.",
      "Collaborated with cross-functional teams to integrate AI-based features and improve platform usability",
      "Overseeing code reviews, mentoring junior developers, and enforcing best practices in version control",
      "Driving UI/UX improvements through analytics-driven design iterations and performance optimizations.",
      "Spearheading migration efforts from legacy React codebases to Next.js App Router, improving developer productivity and app performance.",
    ],
  },
  {
    company: "ScientistX",
    location: "Dhaka",
    position: "Full Stack Developer",
    employmentType: "Remote",
    duration: "Jan 2024 – May 2025",
    responsibilities: [
      "Developed and maintained full-stack web applications using React, Node.js, and Express, integrating MongoDB for scalable data storage.",
      "Built and consumed GraphQL and RESTful APIs to support complex data workflows and real-time updates.",
      "Implemented authentication systems (JWT & OAuth) ensuring secure user access and session management.",
      "Enhanced API performance and reduced load times by up to 35 percent through query optimization and caching techniques.",
      "Collaborated closely with UI/UX designers and cross-functional teams to deliver responsive, user-friendly interfaces and ensure seamless application performance across devices.",
    ],
  },
  {
    company: "CloudySign LLC",
    location: "Dubai",
    position: "Frontend Developer",
    employmentType: "Remote",
    duration: "Feb 2021 – Dec 2023",
    responsibilities: [
      "Designed and implemented RESTful APIs for data interaction between frontend and backend services. Collaborated with UI/UX designers to translate wireframes into responsive and interactive user interfaces using Tailwind CSS and React.",
      "Managed state using tools like Redux/Zustand, and integrated React Query for efficient data fetching and caching. Implemented user authentication, role-based access control, and secure session management.",
      "Built admin dashboards for content management, analytics, and user control using reusable and modular components. Optimized applications for maximum speed and scalability across devices and browsers.",
    ],
  },
];

const Experiences = () => {
  return (
    <div className="my-10">
      {/* <div className="flex justify-center mb-6">
        <h1 className="text-base md:text-lg lg:text-xl text-blue-200 font-bold tracking-widest">
          Experience
        </h1>
      </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-10 max-w-7xl mx-auto">
        {experiences.map((exp, index) => (
          <CardSpotlight
            key={index}
            className="h-fit w-80 lg:w-96 hover:scale-105 transition-all duration-500 ease-in-out"
          >
            <p className="text-xl font-bold relative z-20 mt-2 text-white">
              {exp.company}
            </p>
            <span className="flex items-center gap-1 text-sm text-neutral-300 mt-1">
              <FaLocationArrow /> {exp.location}
            </span>
            <p className="z-20 mt-2">
              {exp.position} - {exp.employmentType} ({exp.duration})
            </p>
            <div className="text-neutral-200 mt-4 relative z-20">
              Responsibilites:
              <ul className="list-none mt-2">
                {exp.responsibilities.map((resp, i) => (
                  <Step key={i} title={resp} />
                ))}
              </ul>
            </div>
          </CardSpotlight>
        ))}
      </div>
    </div>
  );
};

const Step = ({ title }: { title: string }) => {
  return (
    <li className="flex gap-2 items-start">
      <CheckIcon />
      <p className="text-white text-xs md:text-sm">{title}</p>
    </li>
  );
};

const CheckIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M12 2c-.218 0 -.432 .002 -.642 .005l-.616 .017l-.299 .013l-.579 .034l-.553 .046c-4.785 .464 -6.732 2.411 -7.196 7.196l-.046 .553l-.034 .579c-.005 .098 -.01 .198 -.013 .299l-.017 .616l-.004 .318l-.001 .324c0 .218 .002 .432 .005 .642l.017 .616l.013 .299l.034 .579l.046 .553c.464 4.785 2.411 6.732 7.196 7.196l.553 .046l.579 .034c.098 .005 .198 .01 .299 .013l.616 .017l.642 .005l.642 -.005l.616 -.017l.299 -.013l.579 -.034l.553 -.046c4.785 -.464 6.732 -2.411 7.196 -7.196l.046 -.553l.034 -.579c.005 -.098 .01 -.198 .013 -.299l.017 -.616l.005 -.642l-.005 -.642l-.017 -.616l-.013 -.299l-.034 -.579l-.046 -.553c-.464 -4.785 -2.411 -6.732 -7.196 -7.196l-.553 -.046l-.579 -.034a28.058 28.058 0 0 0 -.299 -.013l-.616 -.017l-.318 -.004l-.324 -.001zm2.293 7.293a1 1 0 0 1 1.497 1.32l-.083 .094l-4 4a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 1.32 -1.497l.094 .083l1.293 1.292l3.293 -3.292z"
        fill="currentColor"
        strokeWidth="0"
      />
    </svg>
  );
};

export default Experiences;
