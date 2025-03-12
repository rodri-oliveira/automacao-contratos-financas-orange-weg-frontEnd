import NextAuth, { User } from "next-auth"
import { AdapterUser } from "next-auth/adapters"

import Keycloak from "next-auth/providers/keycloak"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Keycloak
    ],
    callbacks: {
        async jwt({ token, account }) {
            const clientId = process.env.AUTH_KEYCLOAK_ID as string;
            const clientSecret = process.env.AUTH_KEYCLOAK_SECRET as string;
            const refreshUrl = `${process.env.AUTH_KEYCLOAK_ISSUER as string}/protocol/openid-connect/token`;

            if (account) {
                const userProfile: User = {
                    id: token.sub,
                    name: token.name,
                    email: token.email,
                }

                return {
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    refresh_token: account.refresh_token,
                    user: userProfile,
                }
            } else if (Date.now() < (token.expires_at as number) * 1000) {
                return token
            } else {
                if (!token.refresh_token) throw new Error("Missing refresh token")

                try {
                    const response = await fetch(refreshUrl, {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            client_id: clientId,
                            client_secret: clientSecret,
                            grant_type: "refresh_token",
                            refresh_token: token.refresh_token as string,
                        }),
                        method: "POST",
                    });

                    const responseTokens = await response.json()

                    if (!response.ok) throw responseTokens

                    return {
                        ...token,
                        access_token: responseTokens.access_token,
                        expires_at: Math.floor(Date.now() / 1000 + (responseTokens.expires_in as number)),
                        refresh_token: responseTokens.refresh_token ?? token.refresh_token,
                    }
                } catch (error) {
                    return { ...token, error: "RefreshAccessTokenError" as const }
                }
            }
        },
        async session({ session, token }) {
            if (token.user) {
                session.user = token.user as User & AdapterUser
            }

            return session
        },
    },
})

declare module "next-auth" {
    interface Session {
        error?: "RefreshAccessTokenError"
    }
}
