import { useState, useEffect } from "react"
import { Download, Trash2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { URL_BASE } from "../Config/Config"
import CardSkeleton from "../components/CardSkeleton"

const MyFiles = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar acceso
    if (!user || !user.roles || !user.roles.includes('tutor')) {
      navigate('/')
      return
    }

    fetchDocuments()
  }, [currentPage, user, navigate])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${URL_BASE}/api/get_tutor_documents.php?tutor_id=${user.id}&page=${currentPage}`)
      const data = await response.json()
      
      if (data.success) {
        setDocuments(data.data)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("Error al cargar documentos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (doc) => {
    const fileUrl = `${URL_BASE}/${doc.rutaArchivo}`
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = doc.nombreCorto
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = async (documentId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.")) {
      try {
        const response = await fetch(`${URL_BASE}/api/delete_document.php?id=${documentId}`, {
          method: 'DELETE'
        })
        const data = await response.json()
        
        if (data.success) {
          // Actualizar la lista de documentos
          fetchDocuments()
        } else {
          alert("Error al eliminar el documento")
        }
      } catch (error) {
        console.error("Error al eliminar documento:", error)
        alert("Error al eliminar el documento")
      }
    }
  }

  if (!user || user.roles.indexOf('tutor') === -1) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-gray-600">
          No tienes acceso a esta página
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Documentos</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No tienes documentos asignados
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{doc.nombreLargo}</h3>
                  <p className="text-gray-600 mb-4">{doc.nombreCorto}</p>
                  <div className="text-sm text-gray-500 mb-1">
                    <span className="font-medium">Tutores:</span> {doc.tutores.join(", ")}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    <span className="font-medium">Facultades:</span> {doc.facultades.join(", ")}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    <span className="font-medium">Universidades:</span> {doc.universidades.join(", ")}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    <span className="font-medium">Categorías:</span> {doc.categorias.join(", ")}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="font-medium">Etiquetas:</span> {doc.tags.join(", ")}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleDownload(doc)}
                      className="flex items-center justify-center flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 cursor-pointer"
                    >
                      <Download size={18} className="mr-2" />
                      Descargar
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-300 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === page
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MyFiles