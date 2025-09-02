declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      needsProfileCompletion?: boolean
      existingUserId?: string
      hasPassword?: boolean
    }
  }

  interface User {
    role?: string
    needsProfileCompletion?: boolean
    existingUserId?: string
    hasPassword?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    needsProfileCompletion?: boolean
    existingUserId?: string
    hasPassword?: boolean
  }
}
