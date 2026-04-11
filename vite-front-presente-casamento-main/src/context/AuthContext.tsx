import React, { createContext, useState, useEffect, ReactNode } from 'react'

interface AuthState {
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (token: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => { },
  logout: () => { },
})

const TOKEN_KEY = 'accessToken' // ← chave única em todo o projeto

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Lê token salvo e valida na inicialização
    const saved = localStorage.getItem(TOKEN_KEY)
    setState({
      accessToken: saved,
      isAuthenticated: !!saved,
      isLoading: false,
    })
  }, []) // ← sem dependências — roda só uma vez

  const login = (accessToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken)
    setState({ accessToken, isAuthenticated: true, isLoading: false })
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setState({ accessToken: null, isAuthenticated: false, isLoading: false })
  }

  // Enquanto carrega, mostra nada (evita flash de conteúdo incorreto)
  if (state.isLoading) return null

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
