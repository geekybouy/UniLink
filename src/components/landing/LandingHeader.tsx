import React, { useState, useEffect } from "react";

const navLinks = [
  { name: "Home", href: "#" },
  { name: "Features", href: "#features" },
  { name: "About Us", href: "#benefits" },
  { name: "Contact", href: "#footer" },
];

const LandingHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 border-b border-transparent transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-md bg-white/90 shadow-md border-gray-200"
            : "bg-white/95"
        }`}
        aria-label="Site Header"
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <a href="#" className="font-extrabold text-2xl text-primary-900 tracking-tight font-sans drop-shadow-lg">
            <span className="font-extrabold [text-shadow:_0_3px_8px_rgba(45,33,135,0.18)]">Unilink</span>
          </a>
          {/* Desktop nav */}
          <nav className="hidden md:flex gap-7 items-center text-base font-medium">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-primary focus:text-primary transition-colors px-2 py-1 rounded focus:outline-none"
              >
                {link.name}
              </a>
            ))}
          </nav>
          {/* Mobile hamburger */}
          <button
            className="flex md:hidden items-center justify-center p-2 rounded hover:bg-gray-200"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg width="28" height="28" fill="none" stroke="currentColor"><rect x="4" y="7" width="20" height="2" rx="1"/><rect x="4" y="13" width="20" height="2" rx="1"/><rect x="4" y="19" width="20" height="2" rx="1"/></svg>
          </button>
        </div>
        {/* Mobile sidebar */}
        <div
          className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-200 ${
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!mobileOpen}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-white text-gray-900 z-[51] p-6 shadow-xl transform transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="navigation"
          aria-label="Mobile Navigation Menu"
        >
          <button
            className="absolute top-4 right-4"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
          </button>
          <ul className="mt-10 space-y-6 font-semibold text-lg">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded hover:bg-primary hover:text-white transition"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>
      {/* Spacing for sticky header */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
};

export default LandingHeader;
