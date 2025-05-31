import { NavLink } from "react-router";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-rose-50/30 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-screen-xl px-4 py-4 lg:py-6">
        <div className="md:flex md:justify-between items-start">
          <div className="mb-4 md:mb-0 md:max-w-[200px]">
            <NavLink to="/" className="flex items-center">
              <span className="self-center text-xl font-bold whitespace-nowrap dark:text-white">
                Pet<span className="text-rose-500">Haven</span>
              </span>
            </NavLink>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Connecting hearts, finding homes, saving lives.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <div>
              <h2 className="mb-3 text-sm font-semibold text-gray-900 uppercase dark:text-white">Quick Links</h2>
              <ul className="text-sm text-gray-500 dark:text-gray-400">
                <li className="mb-2">
                  <NavLink to="/about" className="hover:text-rose-500">About</NavLink>
                </li>
                <li className="mb-2">
                  <NavLink to="/assist-or-adopt-pets" className="hover:text-rose-500">Assist/Adopt</NavLink>
                </li>
                <li className="mb-2">
                  <NavLink to="/lost-pets" className="hover:text-rose-500">Lost Pets</NavLink>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="mb-3 text-sm font-semibold text-gray-900 uppercase dark:text-white">Resources</h2>
              <ul className="text-sm text-gray-500 dark:text-gray-400">
                <li className="mb-2">
                  <NavLink to="/faq" className="hover:text-rose-500">FAQ</NavLink>
                </li>
                <li className="mb-2">
                  <NavLink to="/nearby-vets" className="hover:text-rose-500">Vets</NavLink>
                </li>
                <li className="mb-2">
                  <NavLink to="/contact" className="hover:text-rose-500">Contact</NavLink>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="mb-3 text-sm font-semibold text-gray-900 uppercase dark:text-white">Get Involved</h2>
              <ul className="text-sm text-gray-500 dark:text-gray-400">
                <li className="mb-2">
                  <NavLink to="/volunteer" className="hover:text-rose-500">Volunteer</NavLink>
                </li>
                <li className="mb-2">
                  <NavLink to="/donate" className="hover:text-rose-500">Donate</NavLink>
                </li>
                <li className="mb-2">
                  <NavLink to="/report-lost-pet" className="hover:text-rose-500">Report</NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <hr className="my-4 border-gray-200 sm:mx-auto dark:border-gray-700" />
        
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-xs text-gray-500 sm:text-center dark:text-gray-400">
            © {new Date().getFullYear()} <NavLink to="/" className="hover:text-rose-500">PetHaven™</NavLink>
          </span>
          <div className="flex mt-3 space-x-4 sm:mt-0">
            <a href="#" className="text-gray-500 hover:text-rose-500">
              <Facebook className="w-4 h-4" />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="text-gray-500 hover:text-rose-500">
              <Instagram className="w-4 h-4" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="text-gray-500 hover:text-rose-500">
              <Twitter className="w-4 h-4" />
              <span className="sr-only">Twitter</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
