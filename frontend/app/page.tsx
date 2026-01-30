"use client";

import React, { useState, useEffect, FormEvent } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  LogOut,
  Mail,
  Lock,
  UserPlus,
  ChevronDown,
  Plus,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface User {
  name: string;
  email: string;
  id?: string;
}

interface Event {
  id: string | number;
  title: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  category?: string;
  image?: string;
}

interface AuthResponse {
  user: User;
  token?: string;
}

interface VerifyResponse {
  valid: boolean;
  user: User;
}

export default function EventsApp() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [createEventForm, setCreateEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    image: "",
  });

  const API_URL = "http://localhost:3000/api";

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data: AuthResponse = await response.json();

      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setShowAuthMenu(false);
      setLoginForm({ email: "", password: "" });

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      loadEvents(data.token);
    } catch (err) {
      setError((err as Error).message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Cadastro falhou");
      }

      const data: AuthResponse = await response.json();

      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setShowAuthMenu(false);
      setSignupForm({ name: "", email: "", password: "", confirmPassword: "" });

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      loadEvents(data.token);
    } catch (err) {
      setError((err as Error).message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const authToken = localStorage.getItem("authToken");

      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(createEventForm),
      });

      if (!response.ok) {
        throw new Error("Falha ao criar evento");
      }

      const newEvent: Event = await response.json();

      setEvents([newEvent, ...events]);
      setShowCreateModal(false);
      setCreateEventForm({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        category: "",
        image: "",
      });
    } catch (err) {
      setError((err as Error).message || "Erro ao criar evento");
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (token?: string) => {
    try {
      const authToken = token || localStorage.getItem("authToken");

      const response = await fetch(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar eventos");
      }

      const data: Event[] = await response.json();
      setEvents(data);
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
      setError("Não foi possível carregar os eventos");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setEvents([]);
    setShowAuthMenu(false);
    localStorage.removeItem("authToken");
  };

  const handleCreateEventClick = () => {
    if (!isAuthenticated) {
      setShowAuthMenu(true);
      return;
    }
    setShowCreateModal(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      fetch(`${API_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data: VerifyResponse) => {
          if (data.valid) {
            setCurrentUser(data.user);
            setIsAuthenticated(true);
            loadEvents(token);
          } else {
            localStorage.removeItem("authToken");
          }
        })
        .catch(() => {
          localStorage.removeItem("authToken");
        });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                KOMMUNITY
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Create Event Button */}
              <button
                onClick={handleCreateEventClick}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                <Plus className="w-5 h-5" />
                <span>Criar Evento</span>
              </button>

              {/* User Area */}
              <div className="relative">
                <button
                  onClick={() => setShowAuthMenu(!showAuthMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-blue-500/20 hover:border-blue-500/40 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  {isAuthenticated && currentUser ? (
                    <span className="text-white font-medium">
                      {currentUser.name}
                    </span>
                  ) : (
                    <span className="text-slate-300">Conta</span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      showAuthMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Auth Dropdown Menu */}
                {showAuthMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAuthMenu(false)}
                    />

                    <div className="absolute right-0 mt-3 w-96 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-500/20 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                      {isAuthenticated ? (
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <User className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-semibold text-lg">
                                {currentUser?.name}
                              </h3>
                              <p className="text-slate-400 text-sm">
                                {currentUser?.email}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-4 py-3 rounded-xl transition-all border border-red-500/20 hover:border-red-500/40"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">Sair</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-6">
                          <h2 className="text-2xl font-bold text-white mb-6">
                            {authMode === "login"
                              ? "Bem-vindo de volta"
                              : "Criar conta"}
                          </h2>

                          {error && (
                            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                              {error}
                            </div>
                          )}

                          {authMode === "login" ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Email
                                </label>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                  <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={loginForm.email}
                                    onChange={(e) =>
                                      setLoginForm({
                                        ...loginForm,
                                        email: e.target.value,
                                      })
                                    }
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    required
                                    disabled={loading}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Senha
                                </label>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                  <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={loginForm.password}
                                    onChange={(e) =>
                                      setLoginForm({
                                        ...loginForm,
                                        password: e.target.value,
                                      })
                                    }
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    required
                                    disabled={loading}
                                  />
                                </div>
                              </div>

                              <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                              >
                                {loading ? "Entrando..." : "Entrar"}
                              </button>

                              <div className="text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthMode("signup");
                                    setError("");
                                  }}
                                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                                >
                                  Não tem uma conta?{" "}
                                  <span className="font-semibold">
                                    Cadastre-se
                                  </span>
                                </button>
                              </div>
                            </form>
                          ) : (
                            <form onSubmit={handleSignup} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Nome completo
                                </label>
                                <div className="relative">
                                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                  <input
                                    type="text"
                                    placeholder="Seu nome"
                                    value={signupForm.name}
                                    onChange={(e) =>
                                      setSignupForm({
                                        ...signupForm,
                                        name: e.target.value,
                                      })
                                    }
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    required
                                    disabled={loading}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Email
                                </label>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                  <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={signupForm.email}
                                    onChange={(e) =>
                                      setSignupForm({
                                        ...signupForm,
                                        email: e.target.value,
                                      })
                                    }
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    required
                                    disabled={loading}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Senha
                                </label>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                  <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={signupForm.password}
                                    onChange={(e) =>
                                      setSignupForm({
                                        ...signupForm,
                                        password: e.target.value,
                                      })
                                    }
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    required
                                    disabled={loading}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Confirmar senha
                                </label>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                  <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={signupForm.confirmPassword}
                                    onChange={(e) =>
                                      setSignupForm({
                                        ...signupForm,
                                        confirmPassword: e.target.value,
                                      })
                                    }
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    required
                                    disabled={loading}
                                  />
                                </div>
                              </div>

                              <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                              >
                                {loading ? "Criando conta..." : "Criar conta"}
                              </button>

                              <div className="text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthMode("login");
                                    setError("");
                                  }}
                                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                                >
                                  Já tem uma conta?{" "}
                                  <span className="font-semibold">Entrar</span>
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Create Event Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowCreateModal(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-500/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white">
                  Criar Novo Evento
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-6 space-y-5">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Título do Evento *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Conferência Tech 2026"
                    value={createEventForm.title}
                    onChange={(e) =>
                      setCreateEventForm({
                        ...createEventForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    placeholder="Descreva o evento..."
                    value={createEventForm.description}
                    onChange={(e) =>
                      setCreateEventForm({
                        ...createEventForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Data *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="date"
                        value={createEventForm.date}
                        onChange={(e) =>
                          setCreateEventForm({
                            ...createEventForm,
                            date: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Horário *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="time"
                        value={createEventForm.time}
                        onChange={(e) =>
                          setCreateEventForm({
                            ...createEventForm,
                            time: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Local *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ex: Centro de Convenções, São Paulo"
                      value={createEventForm.location}
                      onChange={(e) =>
                        setCreateEventForm({
                          ...createEventForm,
                          location: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={createEventForm.category}
                    onChange={(e) =>
                      setCreateEventForm({
                        ...createEventForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    disabled={loading}
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Música">Música</option>
                    <option value="Arte">Arte</option>
                    <option value="Esportes">Esportes</option>
                    <option value="Negócios">Negócios</option>
                    <option value="Educação">Educação</option>
                    <option value="Entretenimento">Entretenimento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    URL da Imagem
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={createEventForm.image}
                      onChange={(e) =>
                        setCreateEventForm({
                          ...createEventForm,
                          image: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl transition-all"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                  >
                    {loading ? "Criando..." : "Criar Evento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isAuthenticated ? (
          <div className="text-center py-20">
            <div className="inline-block bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-3xl mb-6">
              <Calendar className="w-20 h-20 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Bem-vindo ao Events Hub
            </h1>
            <p className="text-slate-400 text-xl mb-8">
              Entre para descobrir eventos incríveis
            </p>
            <div className="inline-block bg-blue-500/10 border border-blue-500/30 rounded-2xl px-8 py-4">
              <p className="text-blue-300 font-medium">
                Clique em "Conta" no canto superior direito para fazer login
              </p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-24 h-24 text-slate-700 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Nenhum evento disponível
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Seja o primeiro a criar um evento!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              <Plus className="w-5 h-5" />
              <span>Criar Primeiro Evento</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">
                Próximos Eventos
              </h2>
              <p className="text-slate-400">
                {events.length} {events.length === 1 ? "evento" : "eventos"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-blue-500/20 hover:border-blue-500/40 transition-all group hover:transform hover:scale-105 duration-300"
                >
                  {event.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {event.category && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                          {event.category}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="space-y-2 mb-4">
                      {event.date && (
                        <div className="flex items-center text-slate-400 text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                          {new Date(event.date).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                      {event.time && (
                        <div className="flex items-center text-slate-400 text-sm">
                          <Clock className="w-4 h-4 mr-2 text-blue-400" />
                          {event.time}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center text-slate-400 text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
