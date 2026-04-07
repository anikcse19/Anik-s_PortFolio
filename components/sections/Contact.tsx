"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import toast from "react-hot-toast";

const CONTACT_INFO = [
  { icon: "", label: "Email", value: "anik@example.com", href: "mailto:anik@example.com" },
  { icon: "", label: "LinkedIn", value: "LinkedIn", href: "https://www.linkedin.com/in/anik-deb-0117641b2/" },
  { icon: "", label: "GitHub", value: "GitHub", href: "https://github.com/Anikcse19" },
  { icon: "", label: "Location", value: "Chattogram, Bangladesh" },
];

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-purple-400 text-sm uppercase tracking-widest mb-4">
            Get In Touch
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white">
            Let&apos;s Work Together
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Contact Info */}
          <motion.div variants={fadeInUp}>
            <GlassCard className="p-8 h-full">
              <h3 className="text-2xl font-bold text-white mb-2">Contact Information</h3>
              <p className="text-neutral-400 mb-8">Feel free to reach out through any of these channels</p>

              <div className="space-y-4">
                {CONTACT_INFO.map((info) => (
                  <div key={info.label}>
                    {info.href ? (
                      <a
                        href={info.href}
                        target={info.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-purple-500/10 rounded-xl transition-colors group"
                      >
                        <span className="text-xl">{info.icon}</span>
                        <span className="text-neutral-300 group-hover:text-purple-400 transition-colors">
                          {info.value}
                        </span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                        <span className="text-xl">{info.icon}</span>
                        <span className="text-neutral-300">{info.value}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={fadeInUp}>
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">Send a Message</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-white placeholder-neutral-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-white placeholder-neutral-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me about your project..."
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-white placeholder-neutral-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isLoading ? "Sending..." : "Send Message "}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
