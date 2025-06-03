import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react"
import PropTypes from "prop-types"
import { URL_BASE } from "../../Config/Config"
import { useAuth } from "../../context/AuthContext"

const FileUploadForm = ({ onClose }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    nombreLargo: "",
    nombreCorto: "",
    archivo: null
  })
  
  const createNewItem = async (type, nombre) => {
    try {
      const response = await fetch(`${URL_BASE}/api/${type === 'tags' ? 'create_tag.php' : 'create_category.php'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre })
      })

      const result = await response.json()
      if (result.success) {
        handleSelect(type, result.data)
        if (type === 'categorias') {
          setCategorias(prev => [...prev, result.data])
        }
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error(`Error creando ${type}:`, error)
      setError(`Error al crear ${type === 'tags' ? 'etiqueta' : 'categoría'}`)
    }
  }

  const [error, setError] = useState("")
  const [searchTerms, setSearchTerms] = useState({
    tutores: "",
    tags: "",
    facultades: "",
    categorias: ""
  })
 
  const [searchResults, setSearchResults] = useState({
    tutores: [],
    tags: [],
    facultades: [],
    categorias: []
  })
  
  const [selectedItems, setSelectedItems] = useState({
    tutores: [],
    tags: [],
    facultades: [],
    categorias: []
  })
  
  const [facultades, setFacultades] = useState([])
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [facultadesRes, categoriasRes] = await Promise.all([
          fetch(`${URL_BASE}/api/get_faculties.php`),
          fetch(`${URL_BASE}/api/get_categories.php`)
        ])
        
        const facultadesData = await facultadesRes.json()
        const categoriasData = await categoriasRes.json()
        
        setFacultades(facultadesData)
        setCategorias(categoriasData)
      } catch (error) {
        console.error("Error cargando datos iniciales:", error)
      }
    }

    fetchInitialData()
  }, [])

  const handleSearch = async (type, searchTerm) => {
    setSearchTerms(prev => ({ ...prev, [type]: searchTerm }))
    
    if (type === 'facultades') {
      const filteredResults = facultades.filter(f => 
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(prev => ({ ...prev, facultades: filteredResults }))
      return
    }
    
    if (type === 'categorias') {
      const filteredResults = categorias.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(prev => ({ ...prev, categorias: filteredResults }))
      if (filteredResults.length === 0 && searchTerm.trim() !== '') {
        setSearchResults(prev => ({
          ...prev,
          categorias: [{ id: 'new', nombre: `Crear categoría: "${searchTerm}"` }]
        }))
      }
      return
    }
    
    if (searchTerm.length < 2) {
      setSearchResults(prev => ({ ...prev, [type]: [] }))
      return
    }

    try {
      const response = await fetch(`${URL_BASE}/api/${type === 'tutores' ? 'search_tutors.php' : 'search_tags.php'}?term=${searchTerm}`)
      const data = await response.json()
      
      if (type === 'tags' && data.length === 0 && searchTerm.trim() !== '') {
        setSearchResults(prev => ({
          ...prev,
          [type]: [...data, { id: 'new', nombre: `Crear etiqueta: "${searchTerm}"` }]
        }))
      } else {
        setSearchResults(prev => ({ ...prev, [type]: data }))
      }
    } catch (error) {
      console.error(`Error buscando ${type}:`, error)
    }
  }
  const handleSelect = (type, item) => {
    if (item.id === 'new') {
      const newItemName = searchTerms[type].trim()
      createNewItem(type, newItemName)
      return
    }

    if (!selectedItems[type].find(selected => selected.id === item.id)) {
      setSelectedItems(prev => ({
        ...prev,
        [type]: [...prev[type], item]
      }))
    }
    setSearchResults(prev => ({ ...prev, [type]: [] }))
    setSearchTerms(prev => ({ ...prev, [type]: '' }))
  }
  const handleRemove = (type, itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== itemId)
    }))
  }


  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF')
        e.target.value = '' // Limpiar el input
        setFormData(prev => ({ ...prev, archivo: null }))
        return
      }
      setFormData(prev => ({ ...prev, archivo: file }))
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    
    if (!formData.archivo) {
      setError("Debe seleccionar un archivo PDF")
      return
    }
    
    const formDataToSend = new FormData()
    formDataToSend.append('nombre', formData.nombreLargo)
    formDataToSend.append('nombre_corto', formData.nombreCorto)
    formDataToSend.append('archivo', formData.archivo)
    formDataToSend.append('usuario_id', user.id)
    formDataToSend.append('facultades', JSON.stringify(selectedItems.facultades.map(f => f.id)))
    formDataToSend.append('tutores', JSON.stringify(selectedItems.tutores.map(t => t.id)))
    formDataToSend.append('tags', JSON.stringify(selectedItems.tags.map(t => t.id)))
    formDataToSend.append('categorias', JSON.stringify(selectedItems.categorias.map(c => c.id)))

    try {
      const response = await fetch(`${URL_BASE}/api/upload_document.php`, {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()
      if (result.success) {
        onClose()
      } else {
        setError(result.message || "Error al subir el documento")
      }
    } catch (error) {
      console.error("Error al subir el documento:", error)
      setError("Error al subir el documento")
    }
  }


  const renderSearchSection = (type, placeholder) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {placeholder}
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerms[type]}
          onChange={(e) => handleSearch(type, e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={`Buscar ${placeholder.toLowerCase()}...`}
        />
        {searchResults[type]?.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
            {searchResults[type].map(item => (
              <div
                key={item.id}
                className={`p-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                  item.id === 'new' ? 'text-red-600' : ''
                }`}
                onClick={() => handleSelect(type, item)}
              >
                {item.id === 'new' && <Plus size={16} className="mr-2" />}
                {item.nombre}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedItems[type].map(item => (
          <div key={item.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
            <span className="text-sm">{item.nombre}</span>
            <button
              type="button"
              onClick={() => handleRemove(type, item.id)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="nombreLargo" className="block text-sm font-medium text-gray-700 mb-1">
          Título del Documento
        </label>
        <input
          type="text"
          id="nombreLargo"
          value={formData.nombreLargo}
          onChange={(e) => setFormData(prev => ({ ...prev, nombreLargo: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="nombreCorto" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Corto
        </label>
        <input
          type="text"
          id="nombreCorto"
          value={formData.nombreCorto}
          onChange={(e) => setFormData(prev => ({ ...prev, nombreCorto: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          required
          maxLength={100}
        />
      </div>

      {renderSearchSection('facultades', 'Facultades')}
      {renderSearchSection('tutores', 'Tutores')}
      {renderSearchSection('tags', 'Tags')}
      {renderSearchSection('categorias', 'Categorías')}

      <div className="mb-6">
        <label htmlFor="archivo" className="block text-sm font-medium text-gray-700 mb-1">
          Subir Archivo (Solo PDF)
        </label>
        <input
          type="file"
          id="archivo"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
        >
          Guardar
        </button>
      </div>
    </form>
  )
}

FileUploadForm.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export default FileUploadForm