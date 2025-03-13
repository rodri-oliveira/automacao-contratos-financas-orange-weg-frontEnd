import { AppBar, Box, Container, IconButton, Toolbar, Typography } from "@mui/material";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { auth, signIn } from "@/app/auth";
import { signOut } from "@/app/auth";
import { redirect } from "next/navigation";
import AutomacaoFinancas from "@/components/AutomacaoFinancas";

export default async function Home() {
    console.log("Renderizando página principal");
    const session = await auth();
    console.log("Sessão:", session ? "Autenticado" : "Não autenticado");

    if (session) {
        if (session?.error === "RefreshAccessTokenError") {
            console.log("Erro de refresh token, redirecionando para login");
            signIn("keycloak", { redirectTo: "/" });
        }
        
        console.log("Renderizando componente AutomacaoFinancas");
        return <AutomacaoFinancas />;
    } else {
        console.log("Redirecionando para login");
        redirect("/login");
    }
}