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
  Search,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";

interface User {
  name: string;
  email: string;
  token?: string;
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
  host?: {
    name: string;
    avatar?: string;
  };
  capacity?: number;
  attendees?: number;
}

interface AuthResponse {
  message: string;
  token?: string;
  user: {
    name: string;
    email: string;
    token?: string;
  };
  errors?: string[];
}

const categories = [
  { id: "all", name: "All" },
  { id: "wellness", name: "Wellness" },
  { id: "technology", name: "Technology" },
  { id: "art-culture", name: "Art & Culture" },
  { id: "social", name: "Social" },
  { id: "outdoor", name: "Outdoor" },
  { id: "food-drink", name: "Food & Drink" },
  { id: "music", name: "Music" },
  { id: "sports", name: "Sports" },
];

export default function EventsApp() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [createEventForm, setCreateEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    image: "",
    capacity: "",
  });

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("currentUser");

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser({ ...user, token: savedToken });
        setIsAuthenticated(true);
        loadEvents(savedToken);
      } catch (err) {
        console.error("Erro ao carregar sessão:", err);
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const token = data.user.token || data.token;
      const userData = {
        name: data.user.name,
        email: data.user.email,
      };

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("currentUser", JSON.stringify(userData));
      }

      setCurrentUser({ ...userData, token });
      setIsAuthenticated(true);
      setShowAuthMenu(false);
      setLoginForm({ email: "", password: "" });

      loadEvents(token);
    } catch (err) {
      setError((err as Error).message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            name: signupForm.name,
            email: signupForm.email,
            password: signupForm.password,
          },
        }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        const errorMessage = data.errors
          ? data.errors.join(", ")
          : data.message || "Cadastro falhou";
        throw new Error(errorMessage);
      }

      const token = data.token;
      const userData = {
        name: data.user.name,
        email: data.user.email,
      };

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("currentUser", JSON.stringify(userData));
      }

      setCurrentUser({ ...userData, token });
      setIsAuthenticated(true);
      setShowAuthMenu(false);
      setSignupForm({ name: "", email: "", password: "" });

      loadEvents(token);
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
      const authToken = currentUser?.token || localStorage.getItem("authToken");

      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          event: createEventForm,
        }),
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
        capacity: "",
      });
    } catch (err) {
      setError((err as Error).message || "Erro ao criar evento");
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (token?: string) => {
    try {
      const authToken =
        token || currentUser?.token || localStorage.getItem("authToken");

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
    }
  };

  const handleLogout = async () => {
    try {
      const authToken = currentUser?.token || localStorage.getItem("authToken");

      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setEvents([]);
      setShowAuthMenu(false);
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
    }
  };

  const handleCreateEventClick = () => {
    if (!isAuthenticated) {
      setShowAuthMenu(true);
      return;
    }
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Calendar className="w-7 h-7 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                Kommunity
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateEventClick}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create Event</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowAuthMenu(!showAuthMenu)}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>{isAuthenticated ? currentUser?.name : "Sign In"}</span>
                </button>

                {showAuthMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAuthMenu(false)}
                    />

                    <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      {isAuthenticated ? (
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-gray-900 font-semibold">
                                {currentUser?.name}
                              </h3>
                              <p className="text-gray-500 text-sm">
                                {currentUser?.email}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-lg transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">Sign Out</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {authMode === "login" ? "Welcome back" : "Join us"}
                          </h2>

                          {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
                              {error}
                            </div>
                          )}

                          {authMode === "login" ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  placeholder="your@email.com"
                                  value={loginForm.email}
                                  onChange={(e) =>
                                    setLoginForm({
                                      ...loginForm,
                                      email: e.target.value,
                                    })
                                  }
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                  disabled={loading}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Password
                                </label>
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
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                  disabled={loading}
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                              >
                                {loading ? "Signing in..." : "Sign In"}
                              </button>

                              <div className="text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthMode("signup");
                                    setError("");
                                  }}
                                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                  Don't have an account?{" "}
                                  <span className="font-semibold">Sign up</span>
                                </button>
                              </div>
                            </form>
                          ) : (
                            <form onSubmit={handleSignup} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Full name
                                </label>
                                <input
                                  type="text"
                                  placeholder="Your name"
                                  value={signupForm.name}
                                  onChange={(e) =>
                                    setSignupForm({
                                      ...signupForm,
                                      name: e.target.value,
                                    })
                                  }
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                  disabled={loading}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  placeholder="your@email.com"
                                  value={signupForm.email}
                                  onChange={(e) =>
                                    setSignupForm({
                                      ...signupForm,
                                      email: e.target.value,
                                    })
                                  }
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                  disabled={loading}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Password
                                </label>
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
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                  disabled={loading}
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                              >
                                {loading ? "Creating..." : "Create Account"}
                              </button>

                              <div className="text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthMode("login");
                                    setError("");
                                  }}
                                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                  Already have an account?{" "}
                                  <span className="font-semibold">Sign in</span>
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

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 via-blue-100/30 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">
              Discover meaningful connections
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Find Your Next
            <br />
            <span className="text-blue-600">Adventure Together</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with like-minded people through events that matter. From
            yoga sessions to tech meetups, find experiences that bring people
            together.
          </p>

          <div className="flex gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, categories, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
            <button
              onClick={handleCreateEventClick}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm"
            >
              <span>Create Event</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["Yoga", "Tech", "Art", "Music", "Food"].map((cat) => (
              <button
                key={cat}
                className="px-6 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-full border border-gray-200 transition-all"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Upcoming Events
          </h2>
          <p className="text-gray-600">Discover experiences waiting for you</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 font-medium rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No events yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to create an amazing event!
            </p>
            <button
              onClick={handleCreateEventClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create First Event</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all group"
              >
                {event.image && (
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {event.category && (
                      <div className="absolute top-4 left-4 px-4 py-1.5 bg-white text-gray-900 text-sm font-medium rounded-full shadow-sm">
                        {event.category}
                      </div>
                    )}
                    {event.host && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-white flex items-center justify-center">
                          {event.host.avatar ? (
                            <img
                              src={event.host.avatar}
                              alt={event.host.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="text-white text-sm">
                          <div className="font-semibold drop-shadow">
                            {event.host.name}
                          </div>
                          <div className="text-xs opacity-90 drop-shadow">
                            Host
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    {event.date && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                        {event.time && (
                          <>
                            <Clock className="w-4 h-4 ml-4 mr-2 text-blue-600" />
                            {event.time}
                          </>
                        )}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                        {event.location}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {event.attendees || 0}/{event.capacity || "∞"}
                      </span>
                      {event.capacity && event.attendees && (
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width: `${Math.min(
                                (event.attendees / event.capacity) * 100,
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all">
                      Join
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create Event Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowCreateModal(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create New Event
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-6 space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Tech Conference 2026"
                    value={createEventForm.title}
                    onChange={(e) =>
                      setCreateEventForm({
                        ...createEventForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    placeholder="Describe your event..."
                    value={createEventForm.description}
                    onChange={(e) =>
                      setCreateEventForm({
                        ...createEventForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={createEventForm.date}
                      onChange={(e) =>
                        setCreateEventForm({
                          ...createEventForm,
                          date: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={createEventForm.time}
                      onChange={(e) =>
                        setCreateEventForm({
                          ...createEventForm,
                          time: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Central Park, NYC"
                    value={createEventForm.location}
                    onChange={(e) =>
                      setCreateEventForm({
                        ...createEventForm,
                        location: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={createEventForm.category}
                      onChange={(e) =>
                        setCreateEventForm({
                          ...createEventForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="">Select category</option>
                      <option value="Wellness">Wellness</option>
                      <option value="Technology">Technology</option>
                      <option value="Art & Culture">Art & Culture</option>
                      <option value="Social">Social</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Food & Drink">Food & Drink</option>
                      <option value="Music">Music</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      placeholder="Max attendees"
                      value={createEventForm.capacity}
                      onChange={(e) =>
                        setCreateEventForm({
                          ...createEventForm,
                          capacity: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={createEventForm.image}
                    onChange={(e) =>
                      setCreateEventForm({
                        ...createEventForm,
                        image: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
