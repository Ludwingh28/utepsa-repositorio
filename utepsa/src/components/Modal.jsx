import { X } from "lucide-react"
import PropTypes from "prop-types"
import LoginForm from "./forms/LoginForm"
import FilterForm from "./forms/FilterForm"
import FileUploadForm from "./forms/FileUploadForm"

const Modal = ({ onClose, mode = "addFile" }) => {
  const renderForm = () => {
    switch (mode) {
      case "login":
        return <LoginForm onClose={onClose} />
      case "filter":
        return <FilterForm onClose={onClose} />
      case "addFile":
        return <FileUploadForm onClose={onClose} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-red-600 cursor-pointer">
          {mode === "login" ? "Iniciar Sesión" : mode === "filter" ? "Filtros" : "Agregar Nuevo Archivo"}
        </h2>
        {renderForm()}
      </div>
    </div>
  )
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["login", "addFile", "filter"]),
}

export default Modal