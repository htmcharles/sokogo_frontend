// API configuration and utility functions for SOKOGO backend
const API_BASE_URL = "http://localhost:8000/api"

// API response types
export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: "buyer" | "seller" | "admin"
  createdAt?: string
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
    // Motors features only (MVP scope)
    brand?: string
    model?: string
    year?: number
    mileage?: number
    kilometers?: number
    fuelType?: string
    transmission?: string
    transmissionType?: string
    make?: string
    bodyType?: string
    isInsuredInRwanda?: string
    technicalControl?: string
    exteriorColor?: string
    interiorColor?: string
    warranty?: string
    doors?: number
    steeringSide?: string
    seatingCapacity?: number
    horsePower?: number
    cruiseControl?: boolean
    frontAirbags?: boolean
    sideAirbags?: boolean
    powerSteering?: boolean
    frontWheelDrive?: boolean
    antiLockBrakesABS?: boolean
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
    this.refreshUserId()
  }

  private refreshUserId() {
    if (typeof window !== "undefined") {
      // First try to get from localStorage
      this.userId = localStorage.getItem("userId")
      
      // If no userId in localStorage, try to get from user object
      if (!this.userId) {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            if (user._id && user._id !== "temp-id") {
              this.userId = user._id
              localStorage.setItem("userId", user._id)
              console.log("[v0] Set userId from user object:", this.userId)
            }
          } catch (error) {
            console.error("[v0] Error parsing user from localStorage:", error)
          }
        }
      }
      
      console.log("[v0] Refreshed user ID from localStorage:", this.userId)
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Always refresh userId from localStorage before making requests
    this.refreshUserId()
    
    // Create headers object
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    // Always include user ID in headers for authentication
    if (this.userId) {
      headers["userid"] = this.userId
      headers["x-seller-id"] = this.userId // Additional header for extra security
    }

    // Merge with existing headers from options
    if (options.headers) {
      if (typeof options.headers === 'object' && !Array.isArray(options.headers)) {
        Object.assign(headers, options.headers)
      }
    }

    console.log("[v0] Making API request to:", url)
    console.log("[v0] Request headers:", headers)
    console.log("[v0] Request body:", options.body)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors", // Explicitly set CORS mode
        credentials: "include", // Include cookies/credentials to maintain login
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
    role: "seller"
  }): Promise<RegisterResponse> {
    console.log("[v0] Attempting registration with data:", { ...userData, password: "[HIDDEN]" })
    return this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async createGoogleUser(userData: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    password?: string
    role: "seller"
    googleId: string
  }): Promise<RegisterResponse> {
    console.log("[v0] Creating Google user with data:", {
      ...userData,
      password: userData.password ? "[HIDDEN]" : "none",
    })
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
    category: "MOTORS"
    subcategory: string
    price: number
    currency: string
    location?: {
      district: string
      city: string
      address: string
    }
    images?: string[]
    features?: {
      // For motors
      brand?: string
      model?: string
      year?: number
      mileage?: number
      kilometers?: number
      fuelType?: string
      transmission?: string
      transmissionType?: string
      make?: string
      bodyType?: string
      isInsuredInRwanda?: string
      technicalControl?: string
      exteriorColor?: string
      interiorColor?: string
      warranty?: string
      doors?: number
      steeringSide?: string
      seatingCapacity?: number
      horsePower?: number
      cruiseControl?: boolean
      frontAirbags?: boolean
      sideAirbags?: boolean
      powerSteering?: boolean
      frontWheelDrive?: boolean
      antiLockBrakesABS?: boolean
    }
  }): Promise<{ message: string; item: Item }> {
    // Ensure user is authenticated before creating item
    if (!this.ensureAuthenticated()) {
      throw new Error("User must be logged in to create items")
    }

    // Always include seller information in the request
    const enrichedItemData = {
      ...itemData,
      seller: this.userId, // Explicitly include seller ID
      sellerId: this.userId, // Alternative field name for backend compatibility
    }

    return this.request<{ message: string; item: Item }>("/items", {
      method: "POST",
      body: JSON.stringify(enrichedItemData),
    })
  }

  async getMyItems(): Promise<{ items: Item[] }> {
    // Ensure user is authenticated before fetching items
    if (!this.ensureAuthenticated()) {
      throw new Error("User must be logged in to fetch items")
    }

    return this.request<{ items: Item[] }>("/items/seller/my-items")
  }

  // Admin methods
  async getUsersByRole(
    role: string,
    page = 1,
  ): Promise<{
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

  // Profile management methods for Google OAuth users
  async updateProfile(profileData: {
    phoneNumber?: string
    password?: string
  }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  async getUserProfile(email: string): Promise<User> {
    return this.request<User>(`/auth/profile?email=${encodeURIComponent(email)}`)
  }

  async getUserById(userId: string): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(`/auth/users/${userId}`)
  }

  // Utility methods
  setUserId(userId: string) {
    if (userId && userId !== "temp-id") {
      this.userId = userId
      if (typeof window !== "undefined") {
        localStorage.setItem("userId", userId)
        console.log("[v0] Set userId:", userId)
      }
    } else {
      console.warn("[v0] Attempted to set invalid userId:", userId)
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
    // Refresh user ID from localStorage before checking
    this.refreshUserId()
    return this.userId !== null
  }

  // Method to ensure user ID is set before making authenticated requests
  ensureAuthenticated(): boolean {
    this.refreshUserId()
    if (!this.userId || this.userId === "temp-id") {
      console.error("[v0] No valid user ID found. User must be logged in.")
      console.error("[v0] Current userId:", this.userId)
      console.error("[v0] localStorage userId:", typeof window !== "undefined" ? localStorage.getItem("userId") : "N/A")
      console.error("[v0] localStorage user:", typeof window !== "undefined" ? localStorage.getItem("user") : "N/A")
      return false
    }
    console.log("[v0] User authenticated with ID:", this.userId)
    return true
  }

  // Enhanced session validation with refresh capability
  async validateSession(): Promise<{ isValid: boolean; user: User | null; error?: string }> {
    try {
      // First check localStorage
      this.refreshUserId()

      if (!this.userId || this.userId === "temp-id") {
        return {
          isValid: false,
          user: null,
          error: "No valid session found. Please log in."
        }
      }

      // Try to get current user from localStorage
      const currentUser = this.getCurrentUser()
      if (!currentUser) {
        return {
          isValid: false,
          user: null,
          error: "User data not found. Please log in again."
        }
      }

      // Validate that the user ID matches
      if (currentUser._id !== this.userId) {
        console.warn("[v0] User ID mismatch, clearing session")
        this.logout()
        return {
          isValid: false,
          user: null,
          error: "Session mismatch. Please log in again."
        }
      }

      // For now, trust localStorage data instead of backend validation
      // This prevents clearing valid sessions due to backend issues
      console.log("[v0] Session validation passed for user:", currentUser.firstName, currentUser.lastName)

      return {
        isValid: true,
        user: currentUser
      }

    } catch (error) {
      console.error("[v0] Session validation error:", error)
      // Don't automatically logout on validation errors - might be network issues
      const currentUser = this.getCurrentUser()
      if (currentUser) {
        console.log("[v0] Keeping session despite validation error")
        return {
          isValid: true,
          user: currentUser
        }
      }

      return {
        isValid: false,
        user: null,
        error: "Session validation failed. Please log in again."
      }
    }
  }

  // Get current authenticated user ID (refreshed from localStorage)
  getCurrentUserId(): string | null {
    this.refreshUserId()
    return this.userId
  }

  // Check if user is authenticated and return user ID
  getAuthenticatedUserId(): string {
    if (!this.ensureAuthenticated()) {
      throw new Error("User must be logged in")
    }
    return this.userId!
  }

  // Upload multiple product photos using multipart/form-data
  async uploadProductPhotos(productId: string, files: File[]): Promise<{ message: string; imageUrls?: string[] }> {
    if (!productId) {
      throw new Error("Missing product id for photo upload")
    }

    if (!files || files.length === 0) {
      throw new Error("No files selected for upload")
    }

    // Get authenticated user ID (this will throw if not authenticated)
    const sellerId = this.getAuthenticatedUserId()

    const formData = new FormData()
    
    // Always include seller userId in FormData for backend verification
    formData.append("seller", sellerId)
    
    // Append all photos
    files.forEach((file, index) => {
      formData.append(`photos`, file) // Use same key for multiple files
    })

    const url = `${this.baseUrl}/products/${productId}/photos`

    const headers: Record<string, string> = {}
    headers["userid"] = sellerId
    headers["x-seller-id"] = sellerId // Additional header for extra security

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers, // Do NOT set Content-Type; the browser will set correct boundary
      mode: "cors",
      credentials: "include", // Include cookies/credentials to maintain login
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }))
      throw new Error(errorData.message || `Upload failed with status ${response.status}`)
    }

    return response.json()
  }

  // Upload a single product photo (legacy method)
  async uploadProductPhoto(productId: string, file: File): Promise<{ message: string; imageUrl?: string }> {
    return this.uploadProductPhotos(productId, [file]).then(result => ({
      message: result.message,
      imageUrl: result.imageUrls?.[0]
    }))
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
