// API configuration and utility functions for SOKOGO backend
const API_BASE_URL = "https://sokogo-backend-a390.onrender.com/api"

// API response types
export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: "buyer" | "seller" | "admin"
  createdAt?: string
  password?: string // Optional password field for Google OAuth users
}

export interface LoginResponse {
  user: User
  message: string
  token?: string
  userId?: string
  sessionInfo?: {
    expiresIn: string
    tokenType: string
    loginTime: string
  }
}

export interface RegisterResponse {
  message: string
  user: User // Changed from Omit<User, "_id"> to User since backend returns _id
  token?: string
  userId?: string
  sessionInfo?: {
    expiresIn: string
    tokenType: string
    loginTime: string
  }
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
      if (!this.userId || this.userId === "temp-id" || this.userId.trim() === "") {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            if (user._id && user._id !== "temp-id" && user._id.trim() !== "") {
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

    // Store user ID for future requests - check both user._id and userId fields
    const userId = response.user._id || (response as any).userId
    if (userId) {
      this.userId = userId
      if (typeof window !== "undefined") {
        localStorage.setItem("userId", userId)
        localStorage.setItem("user", JSON.stringify(response.user))
      }
      console.log("[v0] Login - Stored user ID:", userId)
    } else {
      console.warn("[v0] Login - No user ID found in response:", response)
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
    const response = await this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    // Store user ID for future requests if the response includes it
    const userId = response.user._id || (response as any).userId
    if (userId) {
      this.userId = userId
      if (typeof window !== "undefined") {
        localStorage.setItem("userId", userId)
        localStorage.setItem("user", JSON.stringify(response.user))
      }
      console.log("[v0] Register - Stored user ID:", userId)
    } else {
      console.warn("[v0] Register - No user ID found in response:", response)
    }

    return response
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
    const response = await this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    // Store user ID for future requests if the response includes it
    const userId = response.user._id || (response as any).userId
    if (userId) {
      this.userId = userId
      if (typeof window !== "undefined") {
        localStorage.setItem("userId", userId)
        localStorage.setItem("user", JSON.stringify(response.user))
      }
      console.log("[v0] createGoogleUser - Stored user ID:", userId)
    } else {
      console.warn("[v0] createGoogleUser - No user ID found in response:", response)
    }

    console.log("[v0] createGoogleUser - Response user ID:", response.user?._id)

    return response
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

  // Create listing method for cars
  async createListing(listingData: any): Promise<{ message: string; item: Item }> {
    // Ensure user is authenticated before creating listing
    if (!this.ensureAuthenticated()) {
      throw new Error("User must be logged in to create listings")
    }

    // Transform the listing data to match the backend API structure
    const [make, model] = (listingData.makeModel || "").split("-")

    const payload = {
      title: listingData.title || `${make ? make.toUpperCase() : "Car"} ${model ? model.toUpperCase() : "Listing"}`,
      description: listingData.description || "",
      price: this.parsePrice(listingData.price || ""),
      currency: "RWF",
      category: "MOTORS" as const,
      subcategory: "CARS",
      images: listingData.images || [],
      location: {
        district: listingData.location || "",
        city: listingData.location ? "Kigali" : "",
        address: "",
      },
      features: {
        make: make ? make.charAt(0).toUpperCase() + make.slice(1) : undefined,
        model: model ? model.toUpperCase() : undefined,
        year: listingData.year ? parseInt(listingData.year) : undefined,
        kilometers: this.parseKilometers(listingData.kilometers || ""),
        bodyType: listingData.bodyType ? listingData.bodyType.toUpperCase() : undefined,
        isInsuredInRwanda: listingData.insured || undefined,
        technicalControl: this.normalizeYesNo(listingData.technicalControl || ""),
        exteriorColor: listingData.exteriorColor ? listingData.exteriorColor.charAt(0).toUpperCase() + listingData.exteriorColor.slice(1) : undefined,
        interiorColor: listingData.interiorColor ? listingData.interiorColor.charAt(0).toUpperCase() + listingData.interiorColor.slice(1) : undefined,
        warranty: listingData.warranty || undefined,
        doors: this.toNumber(listingData.doors),
        transmissionType: listingData.transmissionType ? listingData.transmissionType.charAt(0).toUpperCase() + listingData.transmissionType.slice(1) : undefined,
        steeringSide: listingData.steeringSide ? (listingData.steeringSide === "left" ? "Left" : "Right") : undefined,
        fuelType: listingData.fuelType ? listingData.fuelType.charAt(0).toUpperCase() + listingData.fuelType.slice(1) : undefined,
        seatingCapacity: this.toNumber(listingData.seatingCapacity),
        horsePower: this.toNumber(listingData.horsePower),
        frontAirbags: listingData.technicalFeatures?.frontAirbags || undefined,
        sideAirbags: listingData.technicalFeatures?.sideAirbags || undefined,
        powerSteering: listingData.technicalFeatures?.powerSteering || undefined,
        cruiseControl: listingData.technicalFeatures?.cruiseControl || undefined,
        frontWheelDrive: listingData.technicalFeatures?.frontWheelDrive || undefined,
        antiLockBrakesABS: listingData.technicalFeatures?.antiLockBrakes || undefined,
      },
    }

    return this.request<{ message: string; item: Item }>("/items", {
      method: "POST",
      body: JSON.stringify(payload),
    })
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
    // New: optional files to trigger multipart GridFS flow
    imagesFiles?: File[]
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

    // Local-first flow: images should already be paths in itemData.images

    // Legacy JSON flow (no images uploaded here)
    const enrichedItemData = {
      ...itemData,
      seller: this.userId,
      sellerId: this.userId,
      // Merge any existing images with newly uploaded ones
      images: [ ...((itemData.images || []) as string[]) ],
    }

    return this.request<{ message: string; item: Item }>("/items", {
      method: "POST",
      body: JSON.stringify(enrichedItemData),
    })
  }

  // Helper methods for parsing data
  private parsePrice(priceBucket: string): number {
    switch (priceBucket) {
      case "under-5m":
        return 4000000
      case "5m-10m":
        return 7500000
      case "10m-20m":
        return 15000000
      case "20m+":
        return 20000000
      default:
        return 0
    }
  }

  private parseKilometers(range: string): number | undefined {
    switch (range) {
      case "0-10000":
        return 5000
      case "10000-50000":
        return 30000
      case "50000-100000":
        return 75000
      case "100000+":
        return 120000
      default:
        return undefined
    }
  }

  private normalizeYesNo(value: string): string | undefined {
    if (!value) return undefined
    if (value === "valid") return "yes"
    if (value === "expired") return "no"
    return value
  }

  private toNumber(val: string): number | undefined {
    if (!val) return undefined
    const cleaned = val.replace(/[^0-9]/g, "")
    return cleaned ? parseInt(cleaned) : undefined
  }

  // Removed remote upload (Cloudinary/remote) in favor of local upload

  // Upload images to local Next.js API to save under public/uploads
  async uploadImagesLocally(files: File[]): Promise<{ message?: string; imagePaths: string[] }> {
    if (!files || files.length === 0) {
      return { imagePaths: [] }
    }

    const formData = new FormData()
    files.forEach((file) => formData.append("images", file))

    const url = "/api/uploads"
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }))
      throw new Error(errorData.message || `HTTP error! status ${response.status}`)
    }

    return response.json()
  }

  // Upload product photos to Vercel Blob
  async uploadProductPhotos(productId: string, files: File[]): Promise<{ message?: string; imageUrls: string[] }> {
    if (!files || files.length === 0) {
      return { imageUrls: [] }
    }

    try {
      const uploadedUrls: string[] = []

      // Upload each file to Vercel Blob
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`/api/upload-file?filename=${encodeURIComponent(file.name)}`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }))
          throw new Error(errorData.message || `HTTP error! status ${response.status}`)
        }

        const result = await response.json()
        if (result.success && result.url) {
          uploadedUrls.push(result.url)
        }
      }

      return {
        message: `${uploadedUrls.length} photos uploaded successfully`,
        imageUrls: uploadedUrls
      }
    } catch (error: any) {
      throw new Error(`Failed to upload photos: ${error.message}`)
    }
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

  async getUserProfile(email: string): Promise<User & { password?: string }> {
    const resp = await this.request<{ message: string; user: User & { password?: string } }>(
      `/auth/users/email/${encodeURIComponent(email)}`
    )
    return resp.user
  }

  async getUserById(userId: string): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(`/auth/users/${userId}`)
  }

  // Utility methods
  setUserId(userId: string) {
    if (userId && userId !== "temp-id" && userId.trim() !== "") {
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
    return this.userId !== null && this.userId !== "temp-id" && this.userId.trim() !== ""
  }

  // Method to ensure user ID is set before making authenticated requests
  ensureAuthenticated(): boolean {
    this.refreshUserId()
    if (!this.userId || this.userId === "temp-id" || this.userId.trim() === "") {
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

      if (!this.userId || this.userId === "temp-id" || this.userId.trim() === "") {
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

  // Removed product photos upload (legacy remote path)

        // Google OAuth login for existing users
  async loginWithGoogleOAuth(email: string, googleId: string): Promise<LoginResponse> {
    console.log("[v0] Attempting Google OAuth login for existing user:", email)

    // Get user by email (this should return user with password for Google OAuth users)
    const existingUser = await this.getUserProfile(email)

    if (existingUser && existingUser._id) {
      console.log("[v0] User exists, checking for password")

      if (existingUser.password) {
        console.log("[v0] Found password, performing normal login")

        // Use the existing email and password for normal login
        return await this.login(email, existingUser.password)
      } else {
        console.log("[v0] No password found, user needs to complete profile")
        throw new Error("User exists but no password available - needs profile completion")
      }
    } else {
      throw new Error("User not found")
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
