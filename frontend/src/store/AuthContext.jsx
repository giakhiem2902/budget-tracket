import { createContext, useEffect, useReducer } from 'react'
import { authService } from '@/services/auth'

const AuthContext = createContext(null)

const initialState = { user: null, isAuthenticated: false, isLoading: true }

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':        return { ...state, ...action.payload, isLoading: false }
    case 'LOGIN':       return { user: action.payload, isAuthenticated: true, isLoading: false }
    case 'LOGOUT':      return { user: null, isAuthenticated: false, isLoading: false }
    case 'UPDATE_USER': return { ...state, user: { ...state.user, ...action.payload } }
    default:            return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    authService.getSession()
      .then(session => {
        const p = session.getIdToken().payload
        dispatch({ type: 'INIT', payload: { isAuthenticated: true, user: { name: p.name || p.email, email: p.email, sub: p.sub } } })
      })
      .catch(() => dispatch({ type: 'INIT', payload: { isAuthenticated: false, user: null } }))
  }, [])

  async function login(email, password) {
    const user = await authService.login(email, password)
    dispatch({ type: 'LOGIN', payload: user })
  }

  function logout() {
    authService.logout()
    dispatch({ type: 'LOGOUT' })
  }

  function updateUser(updates) {
    dispatch({ type: 'UPDATE_USER', payload: updates })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
