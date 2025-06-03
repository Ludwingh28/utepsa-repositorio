import { Plus, Files, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { useAuth } from "../context/AuthContext";

const FloatingButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Si el usuario es estudiante o no hay usuario, no mostrar el botón
  if (!user || !user.roles || user.roles.includes('estudiante')) {
    return null;
  }

  const handleClick = (action) => {
    setIsMenuOpen(false);
    if (action === 'addFile') {
      setIsModalOpen(true);
    } else if (action === 'dashboard') {
      navigate('/');
    } else if (action === 'myFiles') {
      navigate('/mis-archivos');
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 flex flex-col items-end space-y-2">
        {isMenuOpen && (
          <div className="bg-white rounded-lg shadow-xl p-2 mb-2">
            <button
              onClick={() => handleClick('dashboard')}
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 rounded-md transition-colors duration-200 cursor-pointer"
            >
              <LayoutDashboard size={20} className="mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => handleClick('myFiles')}
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 rounded-md transition-colors duration-200 cursor-pointer"
            >
              <Files size={20} className="mr-2" />
              Mis Archivos
            </button>
            <button
              onClick={() => handleClick('addFile')}
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 rounded-md transition-colors duration-200 cursor-pointer"
            >
              <Plus size={20} className="mr-2" />
              Agregar Documentos
            </button>
          </div>
        )}
        <button
          className="p-4 bg-red-600 text-white rounded-full shadow-xl hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-50 transition-all duration-300 cursor-pointer relative group transform hover:scale-110"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Plus 
            size={26} 
            className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : 'group-hover:rotate-90'}`} 
          />
        </button>
      </div>
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} mode="addFile" />}
    </>
  );
};

export default FloatingButton;