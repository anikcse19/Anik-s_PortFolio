"use client";
import React, { useState } from "react";
import { MagicButton } from "./ui/MagicButton";
import { log } from "console";
import axios from "axios";
import toast from "react-hot-toast";

const ContactMe = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Construct the data object from the state

    setIsLoading(true);
    const data = {
      name: fullName,
      email,
      message,
    };

    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      const result = await response.json();
      setIsLoading(false);
      setEmail("");
      setFullName("");
      setMessage("");
      toast.success("Email sent successfully", {
        position: "top-right",
      });
    } catch (error) {
      setEmail("");
      setFullName("");
      setMessage("");
    }
  };

  return (
    <div id="contact-me" className="mt-5 mb-10">
      <div className="flex justify-center mb-3">
        <h1 className="text-base md:text-lg lg:text-xl text-blue-200 font-bold tracking-widest">
          Contact Me
        </h1>
      </div>

      <div className="mt-10 md:mt-16 flex flex-col lg:flex-row lg:items-center gap-y-6 gap-x-6">
        <div className=" w-full flex justify-center">
          <img
            className="w-[90%] lg:w-[60%] h-[400px] rounded-md"
            src="/contactMe.jpeg"
            alt=""
          />
        </div>
        <div className="w-full self-start">
          <p className="text-base md:text-lg lg:text-xl">Get in Touch</p>
          <p className="text-xs md:text-sm my-5">
            My inbox is always open. Whether you have a question or just want to
            say hello, I will try my best to get back to you!
          </p>
          {/* form */}
          <div className="mt-3 flex flex-col gap-3">
            <input
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              value={fullName}
              placeholder="Full Name"
              className="outline-none px-8 py-2 rounded bg-slate-700"
            />
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              value={email}
              placeholder="Your email"
              className="outline-none px-8 py-2 rounded bg-slate-700"
            />
            <textarea
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              name="message"
              value={message}
              id="message"
              placeholder="Your message"
              className="outline-none px-8 py-2 rounded bg-slate-700 resize-none"
            ></textarea>
            <div>
              <div className="relative outline-none inline-flex h-10 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                <span className="absolute inset-[-1000%] outline-none animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span
                  onClick={() => handleSubmit()}
                  className="outline-none  gap-2 h-full w-full cursor-pointer items-center justify-center rounded-md bg-slate-950 px-3 py-1 text-xs md:text-sm lg:text-base font-medium text-slate-400 backdrop-blur-3xl"
                >
                  {isLoading ? "Loading...." : " Send"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMe;
