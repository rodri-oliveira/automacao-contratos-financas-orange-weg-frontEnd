import NextAuth, { User } from "next-auth"
import { AdapterUser } from "next-auth/adapters"
import { JWT } from "next-auth/jwt"

import Keycloak from "next-auth/providers/keycloak"

// Estendendo os tipos para incluir os campos personalizados
declare module "next-auth" {
    interface Session {
        error?: "RefreshAccessTokenError"
        user?: User & AdapterUser
        accessToken?: string
    }
    
    interface JWT {
        access_token?: string
        expires_at?: number
        refresh_token?: string
        user?: User
        error?: "RefreshAccessTokenError"
    }
}

// Certifique-se de que as variáveis de ambiente estão definidas corretamente
const keycloakIssuer = process.env.AUTH_KEYCLOAK_ISSUER;
const keycloakClientId = process.env.AUTH_KEYCLOAK_ID;
const keycloakClientSecret = process.env.AUTH_KEYCLOAK_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

// Verificações de segurança
if (!keycloakIssuer) {
    console.error("AUTH_KEYCLOAK_ISSUER não está definido!");
}

if (!keycloakClientId) {
    console.error("AUTH_KEYCLOAK_ID não está definido!");
}

if (!keycloakClientSecret) {
    console.error("AUTH_KEYCLOAK_SECRET não está definido!");
}

if (!nextAuthUrl) {
    console.error("NEXTAUTH_URL não está definido!");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Keycloak({
            clientId: process.env.AUTH_KEYCLOAK_ID as string,
            clientSecret: process.env.AUTH_KEYCLOAK_SECRET as string,
            issuer: process.env.AUTH_KEYCLOAK_ISSUER as string,
            authorization: {
                params: {
                    scope: "openid email profile"
                }
            }
        })
    ],
    pages: {
        signIn: "/login",
        signOut: "/login",
        error: "/login",
    },
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
            } else if (token.expires_at && Date.now() < (token.expires_at as number) * 1000) {
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
            
            session.accessToken = token.access_token as string;
            session.error = token.error;

            return session
        },
    },
    debug: process.env.NODE_ENV === "development",
    trustHost: true,
})
