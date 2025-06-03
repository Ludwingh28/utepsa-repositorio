import { useState, useEffect } from "react"
import { X } from "lucide-react"
import PropTypes from "prop-types"
import { URL_BASE } from "../../Config/Config"

const FilterForm = ({ onClose }) => {
  const [searchTerms, setSearchTerms] = useState({
    tutores: "",
    categorias: "",
    tags: ""
  })
  
  const [searchResults, setSearchResults] = useState({
    tutores: [],
    categorias: [],
    tags: []
  })
  
  const [selectedItems, setSelectedItems] = useState({
    tutores: [],
    categorias: [],
    tags: []
  })
  
  const [dateType, setDateType] = useState('specific')
  const [selectedDate, setSelectedDate] = useState(null)
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  })
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(`${URL_BASE}/api/get_categories.php`)
        const data = await response.json()
        setCategorias(data)
      } catch (error) {
        console.error("Error al cargar categorías:", error)
      }
    }
    fetchCategorias()
  }, [])

  const handleSearch = async (type, searchTerm) => {
    setSearchTerms(prev => ({ ...prev, [type]: searchTerm }))
    
    if (type === 'categorias') {
      const filteredResults = categorias.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(prev => ({ ...prev, categorias: filteredResults }))
      return
    }
    
    if (searchTerm.length < 2) {
      setSearchResults(prev => ({ ...prev, [type]: [] }))
      return
    }

    try {
      const endpoint = type === 'tutores' ? 'search_tutors.php' : 'search_tags.php'
      const response = await fetch(`${URL_BASE}/api/${endpoint}?term=${searchTerm}`)
      const data = await response.json()
      setSearchResults(prev => ({ ...prev, [type]: data }))
    } catch (error) {
      console.error(`Error buscando ${type}:`, error)
    }
  }

  const handleSelect = (type, item) => {
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

  const handleSubmit = (e) => {
    e.preventDefault()
    const filters = {
      tutores: selectedItems.tutores.map(t => t.id),
      categorias: selectedItems.categorias.map(c => c.id),
      tags: selectedItems.tags.map(t => t.id)
    }

    if (dateType === 'specific' && selectedDate) {
      filters.fecha = selectedDate
    } else if (dateType === 'range' && dateRange.start && dateRange.end) {
      filters.fechaInicio = dateRange.start
      filters.fechaFin = dateRange.end
    }

    onClose(filters)
  }

  const renderSearchInput = (type, label) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerms[type]}
          onChange={(e) => handleSearch(type, e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={`Buscar ${label.toLowerCase()}...`}
        />
        {searchResults[type]?.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
            {searchResults[type].map(item => (
              <div
                key={item.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(type, item)}
              >
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
      {renderSearchInput('tutores', 'Tutores')}
      {renderSearchInput('categorias', 'Categorías')}
      {renderSearchInput('tags', 'Etiquetas')}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Filtro de Fecha
        </label>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="dateType"
              value="specific"
              checked={dateType === 'specific'}
              onChange={(e) => setDateType(e.target.value)}
              className="mr-2"
            />
            Fecha Específica
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="dateType"
              value="range"
              checked={dateType === 'range'}
              onChange={(e) => setDateType(e.target.value)}
              className="mr-2"
            />
            Rango de Fechas
          </label>
        </div>

        {dateType === 'specific' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={dateRange.start || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={dateRange.end || ''}
                min={dateRange.start || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => onClose(null)}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 cursor-pointer"
        >
          Aplicar Filtros
        </button>
      </div>
    </form>
  )
}

FilterForm.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default FilterForm