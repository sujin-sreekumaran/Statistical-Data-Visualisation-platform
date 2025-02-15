import { signOut } from "next-auth/react";
import React from "react";

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const handleLogout = async () => {
    onLogout();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <nav className="bg-white shadow">
      {/* Add your navbar content here */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Add logo or site name */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Data Visualisation Platform</span>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="ml-4 px-3 bg-red-800 py-2 rounded-md text-sm font-medium text-white hover:bg-red-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
