import { AppBar, Box, Container, IconButton, Toolbar, Typography, Button } from "@mui/material";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { auth, signIn } from "@/app/auth";
import { redirect } from "next/navigation";
import AutomacaoFinancas from "@/components/AutomacaoFinancas";
import LogoutButton from "@/components/LogoutButton";

export default async function Home() {
    console.log("Renderizando página principal");
    const session = await auth();
    console.log("Sessão:", session ? "Autenticado" : "Não autenticado");

    if (!session) {
        console.log("Redirecionando para login");
        redirect("/login");
    }

    if (session?.error === "RefreshAccessTokenError") {
        console.log("Erro de refresh token, redirecionando para login");
        signIn("keycloak", { redirectTo: "/" });
    }

    console.log("Renderizando componente AutomacaoFinancas");
    
    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Barra de navegação com altura reduzida e cor azul WEG */}
            <AppBar 
                position="static" 
                sx={{ 
                    backgroundColor: '#00579d', // Cor azul WEG
                    mb: 2, // Margem inferior reduzida
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' // Sombra sutil
                }}
            >
                <Toolbar variant="dense" sx={{ minHeight: '48px', px: 2 }}> {/* Altura reduzida */}
                    <Typography 
                        variant="subtitle1" 
                        component="div" 
                        sx={{ 
                            flexGrow: 1, 
                            fontWeight: 500,
                            fontSize: '1rem'
                        }}
                    >
                        Automação Financas
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            mr: 2, 
                            fontWeight: "bold",
                            fontSize: '0.875rem'
                        }}
                    >
                        Olá, {session.user?.name}
                    </Typography>
                    
                    {/* Componente cliente para o botão de logout */}
                    <LogoutButton />
                </Toolbar>
            </AppBar>
            
            {/* Componente principal */}
            <AutomacaoFinancas />
        </Box>
    );
}