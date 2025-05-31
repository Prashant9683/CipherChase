import React from 'react';
import { Link } from '../ui/Link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A3A5A] text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-serif text-white mb-2">CipherQuest</h3>
            <p className="text-sm max-w-md">
              Create and solve exciting treasure hunts with various encryption
              methods, ciphers, and puzzles. Perfect for education, team
              building, or just for fun!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-12">
            <div>
              <h4 className="text-white font-medium mb-3">Learn</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/library" className="hover:text-[#D4AF37]">
                    Cipher Library
                  </Link>
                </li>
                <li>
                  <Link to="/tutorials" className="hover:text-[#D4AF37]">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-[#D4AF37]">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="hover:text-[#D4AF37]">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#D4AF37]">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#D4AF37]">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          &copy; {new Date().getFullYear()} CipherQuest. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
