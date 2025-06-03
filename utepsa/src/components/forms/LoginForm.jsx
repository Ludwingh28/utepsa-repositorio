import { useState } from "react"
import PropTypes from "prop-types"
import { URL_BASE } from "../../Config/Config"
import { useAuth } from "../../context/AuthContext"

const LoginForm = ({ onClose }) => {
  const [loginError, setLoginError] = useState("")
  const { login } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    const username = e.target.username.value
    const password = e.target.password.value

    try {
      const response = await fetch(`${URL_BASE}/Login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      
      if (data.success) {
        login(data.user)
        onClose()
      } else {
        setLoginError(data.message || "Error al iniciar sesión")
      }
    } catch (error) {
      setLoginError("Error de conexión")
    }
  }

  return (
    <form onSubmit={handleLogin}>
      {loginError && (
        <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
          {loginError}
        </div>
      )}
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Usuario
        </label>
        <input
          type="text"
          id="username"
          name="username"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
      </div>
      <div className="mb-6">
        <a href="#" className="text-sm text-red-600 hover:text-red-800">
          ¿Olvidó su contraseña?
        </a>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 cursor-pointer"
        >
          Iniciar Sesión
        </button>
      </div>
    </form>
  )
}

LoginForm.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export default LoginForm