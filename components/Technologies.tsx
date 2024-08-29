import { title } from "process";
import React from "react";
import { MagicButton } from "./ui/MagicButton";

const Technologies = () => {
  const frontendSkill = [
    {
      title: "JavaScript",
      img: "/js.png",
    },
    {
      title: "TypeScript",
      img: "/ts.png",
    },
    {
      title: "React.Js",
      img: "/react.png",
    },
    {
      title: "Next.Js",
      img: "/next.png",
    },
    {
      title: "Redux",
      img: "/redux.png",
    },
    {
      title: "Tailwind",
      img: "/tail.png",
    },
    {
      title: "ShadeCn",
      img: "/shadecn.png",
    },
    {
      title: "Material UI",
      img: "/mate.png",
    },
    {
      title: "Html5",
      img: "/html.png",
    },
    {
      title: "CSS3",
      img: "/css.png",
    },
  ];

  const backendSkill = [
    {
      title: "Node.Js",
      img: "/node.png",
    },
    {
      title: "Express",
      img: "/express.png",
    },
    {
      title: "Python",
      img: "/python.png",
    },
    {
      title: "Web Sockets",
      img: "/webSock.png",
    },
  ];

  const dataBaseSkill = [
    {
      title: "MongoDB",
      img: "/mongodb.png",
    },
    {
      title: "Firebase",
      img: "/firebase.png",
    },
  ];

  const othersSkill = [
    {
      title: "Git",
      img: "/git.png",
    },
    {
      title: "Vercel",
      img: "/vercel.png",
    },
    {
      title: "Netlify",
      img: "/netlify.png",
    },
    {
      title: "Jira",
      img: "/jira.png",
    },
  ];
  return (
    <div id="technologies" className="my-8 md:my-16">
      <div className="flex justify-center mb-3">
        <h1 className="text-base md:text-lg lg:text-xl text-blue-200 font-bold tracking-widest">
          Tech Stack
        </h1>
      </div>
      <div className="flex flex-col">
        <div>
          <p>Frontend</p>
          <div className="grid grid-cols-3 md:grid-cols-6 space-x-2 space-y-3 py-4">
            {frontendSkill.map((f, i) => (
              <MagicButton
                key={i}
                title={f.title}
                img={f.img}
                position="right"
                from="techStack"
              />
            ))}
          </div>
        </div>

        <div>
          <p>Backend</p>
          <div className="grid grid-cols-3 md:grid-cols-6 space-x-2 space-y-3 py-4">
            {backendSkill.map((f, i) => (
              <MagicButton
                key={i}
                title={f.title}
                img={f.img}
                position="right"
                from="techStack"
              />
            ))}
          </div>
        </div>
        <div>
          <p>Database</p>
          <div className="grid grid-cols-3 md:grid-cols-6 space-x-2 space-y-3 py-4">
            {dataBaseSkill.map((f, i) => (
              <MagicButton
                key={i}
                title={f.title}
                img={f.img}
                position="right"
                from="techStack"
              />
            ))}
          </div>
        </div>
        <div>
          <p>Others</p>
          <div className="grid grid-cols-3 md:grid-cols-6 space-x-2 space-y-3 py-4">
            {othersSkill.map((f, i) => (
              <MagicButton
                key={i}
                title={f.title}
                img={f.img}
                position="right"
                from="techStack"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Technologies;
