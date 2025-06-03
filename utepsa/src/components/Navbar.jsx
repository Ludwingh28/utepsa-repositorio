import { UserCircle, LogOut } from "lucide-react";
import { useState, useRef } from "react";
import Modal from "./Modal";
import Logo from "../assets/logo_UTEPSA.png";
import { URL_BASE } from "../Config/Config";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, login, logout } = useAuth(); 

  const handleLogout = async () => {
    try {
      await fetch(`${URL_BASE}/Logout.php`);
      logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      <nav className="bg-red-600 shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img src={Logo} alt="UTEPSA Logo" className="h-12 w-auto bg-white rounded-full p-1" />
          </div>
          <div className="flex items-center relative" ref={menuRef}>
            {!user ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-white hover:text-gray-200 transition-colors duration-300 flex items-center cursor-pointer"
              >
                <UserCircle size={32} className="mr-2" />
                <span>Iniciar Sesión</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white hover:text-gray-200 transition-colors duration-300 flex items-center cursor-pointer"
                >
                  <UserCircle size={32} />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      {user.username}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <LogOut size={16} className="mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      {isModalOpen && (
        <Modal 
          onClose={() => setIsModalOpen(false)} 
          mode="login" 
          onLoginSuccess={(userData) => {
            login(userData); 
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;