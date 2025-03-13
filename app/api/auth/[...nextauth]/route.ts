import { handlers } from "@/app/auth"
export const { GET, POST } = handlers


issuer: process.env.AUTH_KEYCLOAK_ISSUER,
clientId: process.env.AUTH_KEYCLOAK_ID,
clientSecret: process.env.AUTH_KEYCLOAK_SECRET
