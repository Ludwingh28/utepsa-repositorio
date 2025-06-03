import { Search, Filter, Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import CardSkeleton from "../components/CardSkeleton";
import { useAuth } from "../context/AuthContext";
import { URL_BASE } from "../Config/Config";

const Dashboard = () => {
  const { user } = useAuth();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, searchTerm, activeFilters]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        search: searchTerm,
      });

      if (activeFilters) {
        if (activeFilters.tutores?.length) {
          params.append("tutores", JSON.stringify(activeFilters.tutores));
        }
        if (activeFilters.categorias?.length) {
          params.append("categorias", JSON.stringify(activeFilters.categorias));
        }
        if (activeFilters.tags?.length) {
          params.append("tags", JSON.stringify(activeFilters.tags));
        }
        if (activeFilters.fecha) {
          params.append("fecha", activeFilters.fecha);
        }
        if (activeFilters.fechaInicio && activeFilters.fechaFin) {
          params.append("fechaInicio", activeFilters.fechaInicio);
          params.append("fechaFin", activeFilters.fechaFin);
        }
      }

      const response = await fetch(`${URL_BASE}/api/get_documents.php?${params}`);
      const data = await response.json();

      if (data.success) {
        setDocuments(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterClose = (filters) => {
    if (filters) {
      setActiveFilters(filters);
      setCurrentPage(1);
    }
    setIsFilterModalOpen(false);
  };

  const handleDocumentAction = (doc) => {
    const fileUrl = `${URL_BASE}/${doc.rutaArchivo}`;
    console.log("URL del PDF:", fileUrl);

    if (user) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = doc.nombreCorto;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Abrir PDF en una nueva ventana sin botones de descarga/impresión
      const pdfWindow = window.open("", "_blank");
      pdfWindow.document.write(`
        <html>
          <head>
            <title>${doc.nombreLargo}</title>
            <style>
              body, html {
                margin: 0;
                padding: 0;
                height: 100%;
                overflow: hidden;
              }
              embed {
                width: 100%;
                height: 100%;
                border: none;
              }
            </style>
          </head>
          <body>
            <embed 
              src="${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&printbutton=0"
              type="application/pdf"
            />
          </body>
        </html>
      `);
      pdfWindow.document.close();
    }
  };

  const renderActionButton = (doc) => {
    if (!user) {
      return (
        <button
          onClick={() => handleDocumentAction(doc)}
          className="flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 cursor-pointer"
        >
          <Eye size={18} className="mr-2" />
          Visualizar
        </button>
      );
    }

    return (
      <button
        onClick={() => handleDocumentAction(doc)}
        className="flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 cursor-pointer"
      >
        <Download size={18} className="mr-2" />
        Descargar
      </button>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="relative mb-8 flex">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-3 pl-12 bg-white border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="flex items-center justify-center px-4 bg-red-600 text-white rounded-r-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 cursor-pointer"
        >
          <Filter size={20} className="mr-2" />
          Filtros {activeFilters && <span className="ml-1">•</span>}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center text-gray-500">No se encontraron documentos</div>
      ) : (
        <>
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
                {renderActionButton(doc)}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-md cursor-pointer ${
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

      {isFilterModalOpen && (
        <Modal 
          onClose={handleFilterClose}
          mode="filter" 
        />
      )}
    </div>
  );
};

export default Dashboard;