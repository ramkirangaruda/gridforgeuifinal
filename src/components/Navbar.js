import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GooeyNav from "./GooeyNav";
import DecryptedText from "./DecryptedText";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveIndex = () => {
    switch (location.pathname) {
      case "/":
        return 0;
      case "/submit-task":
        return 1;
      default:
        return 0;
    }
  };

  const handleNavigation = (href) => {
    navigate(href);
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Submit Task", href: "/submit-task" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-lg border-b border-cyan-300/40 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-0">
        <div className="flex items-center justify-between h-16">
          {/* Logo with DecryptedText */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <a className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent hover:from-cyan-200 hover:to-blue-300 transition-all">
              <DecryptedText
                text="GridForge"
                speed={60}
                maxIterations={12}
                sequential
                revealDirection="center"
                animateOn="hover"
                useOriginalCharsOnly={true}
                className="text-transparent"
                encryptedClassName="text-cyan-400/50"
              />
            </a>
          </div>

          {/* Gooey Nav */}
          <div className="flex-1 flex justify-center">
            <GooeyNav
              items={navItems}
              onItemClick={handleNavigation}
              particleCount={12}
              particleDistances={[80, 15]}
              particleR={80}
              initialActiveIndex={getActiveIndex()}
              animationTime={500}
              timeVariance={250}
              colors={[1, 2, 3, 4]}
            />
          </div>

          {/* Empty div for spacing */}
          <div className="w-24" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
