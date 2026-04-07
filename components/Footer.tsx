import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="glass rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="text-2xl font-bold text-white">AD.</div>

            {/* Copyright */}
            <p className="text-neutral-400 text-sm">
              © {currentYear} Anik Chandra Deb. All rights reserved.
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <span>📍</span>
              <span>Chattogram, Bangladesh</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
