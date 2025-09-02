import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { apiClient } from "./api"

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await apiClient.login(credentials.email, credentials.password)
          return {
            id: response.user._id,
            email: response.user.email,
            name: `${response.user.firstName} ${response.user.lastName}`,
            role: response.user.role,
          }
        } catch (error) {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists by email
          const existingUser = await apiClient.getUserProfile(user.email!)

          if (existingUser && existingUser._id) {
            // User exists, check if they have a password
            if (existingUser.password) {
              console.log("[NextAuth] Google user exists with password:", existingUser.email)
              return true
            } else {
              console.log("[NextAuth] Google user exists but needs profile completion:", existingUser.email)
              return true
            }
          } else {
            // User doesn't exist, needs profile completion
            console.log("[NextAuth] Google user doesn't exist, needs profile completion")
            return true
          }
        } catch (error) {
          console.error("[NextAuth] Error checking user existence:", error)
          // If we can't check, assume user needs profile completion
          return true
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
      }
      if (account?.provider === "google") {
        // Check if user exists and has a password
        try {
          const existingUser = await apiClient.getUserProfile(token.email!)
          if (existingUser && existingUser._id) {
            if (existingUser.password) {
              // User exists with password, don't need profile completion
              token.needsProfileCompletion = false
              token.existingUserId = existingUser._id
              token.hasPassword = true
            } else {
              // User exists but no password, needs profile completion
              token.needsProfileCompletion = true
              token.existingUserId = existingUser._id
              token.hasPassword = false
            }
          } else {
            // User doesn't exist, needs profile completion
            token.needsProfileCompletion = true
          }
        } catch (error) {
          console.error("[NextAuth] Error in JWT callback:", error)
          token.needsProfileCompletion = true
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.needsProfileCompletion = token.needsProfileCompletion as boolean
        session.user.existingUserId = token.existingUserId as string
        session.user.hasPassword = token.hasPassword as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
}
