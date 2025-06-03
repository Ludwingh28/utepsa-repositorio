const CardSkeleton = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        
        {/* Tutores */}
        <div className="space-y-2 mb-1">
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        
        {/* Facultades */}
        <div className="space-y-2 mb-1">
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        
        {/* Universidades */}
        <div className="space-y-2 mb-1">
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        
        {/* Categorías */}
        <div className="space-y-2 mb-1">
          <div className="h-4 bg-gray-200 rounded w-3/6"></div>
        </div>
        
        {/* Tags */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        
        {/* Botón */}
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    )
  }
  
  export default CardSkeleton