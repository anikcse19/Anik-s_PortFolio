import React from "react";
import { InfiniteMovingCards } from "./ui/InfiniteMovingCrads";

const Testimonials = () => {
  return (
    <div id="testimonials" className="my-5 w-full">
      <div className="flex justify-center mb-3">
        <h1 className="text-base md:text-lg lg:text-xl text-blue-200 font-bold tracking-widest">
          Testimonials
        </h1>
      </div>
      <div className="h-fit py-5 rounded-md flex flex-col antialiased bg-white dark:bg-transparent dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </div>
    </div>
  );
};

export default Testimonials;

const testimonials = [
  {
    quote:
      "He is a very good man and also a passionate developer. I loved his work.",
    name: "Fahim Ahmed",
    title: "Pappi-Pets",
  },
  {
    quote: "An amazing person and very friendly during the whole time",
    name: "Zack Benton",
    title: "Guitar-World",
  },
];
