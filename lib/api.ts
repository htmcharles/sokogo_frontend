// API configuration and utility functions for SOKOGO backend
const API_BASE_URL = "http://localhost:8000/api"

// API response types
export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: 'buyer' | 'seller' | 'admin'
}

export interface LoginResponse {
  user: User
  message: string
}

export interface RegisterResponse {
  message: string
  user: Omit<User, "_id">
}

export interface ApiError {
  message: string
  error?: string
}

export interface Item {
  _id: string
  title: string
  description: string
  price: number
  currency?: string
  category: string
  subcategory?: string
  seller: string | User
  images: string[]
  status?: string
  location: {
    district?: string
    city?: string
    address?: string
  }
  features?: {
    // Motors features
    brand?: string
    model?: string
    year?: number
    mileage?: number
    fuelType?: string
    transmission?: string

    // Property features
    bedrooms?: number
    bathrooms?: number
    area?: number
    areaUnit?: string

    // Electronics features
    condition?: string
    warranty?: boolean
  }
  contactInfo?: {
    phone?: string
    email?: string
  }
  bookingUrl?: string
  condition: string
  createdAt: string
  updatedAt: string
  popularity?: number
}

// API utility functions
class ApiClient {
  private baseUrl: string
  private userId: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    // Get user ID from localStorage if available
    if (typeof window !== "undefined") {
      this.userId = localStorage.getItem("userId")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    }

    // Add user ID to headers if available
    if (this.userId) {
      headers["userid"] = this.userId
    }

    console.log("[v0] Making API request to:", url)
    console.log("[v0] Request headers:", headers)
    console.log("[v0] Request body:", options.body)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors", // Explicitly set CORS mode
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }))
        console.log("[v0] Error response:", errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Success response:", data)
      return data
    } catch (error) {
      console.error("[v0] API request failed:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please ensure the backend server is running on port 8000.")
      }
      throw error
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    // Store user ID for future requests
    if (response.user._id) {
      this.userId = response.user._id
      if (typeof window !== "undefined") {
        localStorage.setItem("userId", response.user._id)
        localStorage.setItem("user", JSON.stringify(response.user))
      }
    }

    return response
  }

  async register(userData: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    password: string
    role: 'buyer' | 'seller' | 'admin'
  }): Promise<RegisterResponse> {
    console.log("[v0] Attempting registration with data:", { ...userData, password: "[HIDDEN]" })
    return this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  // Items methods
  async getAllItems(): Promise<{ items: Item[] }> {
    return this.request<{ items: Item[] }>("/items")
  }

  async getPopularItems(category: string): Promise<{ items: Item[] }> {
    return this.request<{ items: Item[] }>(`/items?category=${category}`)
  }

  async getItemById(itemId: string): Promise<Item> {
    return this.request<Item>(`/items/${itemId}`)
  }

  async createItem(itemData: {
    title: string
    description: string
    category: "MOTORS" | "PROPERTY" | "ELECTRONICS"
    subcategory: string
    price: number
    currency: string
    location: {
      district: string
      city: string
      address: string
    }
    images: string[]
    features: {
      // For motors
      brand?: string
      model?: string
      year?: number
      mileage?: number
      fuelType?: string
      transmission?: string

      // For property
      bedrooms?: number
      bathrooms?: number
      area?: number
      areaUnit?: string

      // For electronics
      condition?: string
      warranty?: boolean
    }
    contactInfo: {
      phone: string
      email: string
    }
  }): Promise<{ message: string; item: Item }> {
    return this.request<{ message: string; item: Item }>("/items", {
      method: "POST",
      body: JSON.stringify(itemData),
    })
  }

  async getMyItems(): Promise<{ items: Item[] }> {
    return this.request<{ items: Item[] }>("/items/seller/my-items")
  }

  // Admin methods
  async getUsersByRole(role: string, page: number = 1): Promise<{
    message: string
    users: User[]
    pagination: {
      currentPage: number
      totalPages: number
      totalUsers: number
      usersPerPage: number
    }
  }> {
    return this.request<{
      message: string
      users: User[]
      pagination: {
        currentPage: number
        totalPages: number
        totalUsers: number
        usersPerPage: number
      }
    }>(`/auth/users?role=${role}&page=${page}`)
  }

  // Utility methods
  setUserId(userId: string) {
    this.userId = userId
    if (typeof window !== "undefined") {
      localStorage.setItem("userId", userId)
    }
  }

  logout() {
    this.userId = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("userId")
      localStorage.removeItem("user")
    }
  }

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  isAuthenticated(): boolean {
    return this.userId !== null
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
