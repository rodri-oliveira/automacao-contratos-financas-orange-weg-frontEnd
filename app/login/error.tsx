"use client";

import { Box, Button, Container, Paper, Typography, Alert } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function ErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const [isLoading, setIsLoading] = useState(false);

    const getErrorMessage = (errorCode: string) => {
        switch (errorCode) {
            case "Configuration":
                return "Erro de configuração do servidor. Por favor, entre em contato com o suporte técnico.";
            case "AccessDenied":
                return "Acesso negado. Você não tem permissão para acessar este recurso.";
            case "Verification":
                return "O link de verificação expirou ou já foi usado.";
            default:
                return "Ocorreu um erro durante a autenticação. Por favor, tente novamente.";
        }
    };

    const handleRetry = async () => {
        setIsLoading(true);
        await signIn("keycloak", { callbackUrl: "/" });
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h5" component="h1" gutterBottom sx={{ color: '#00579d' }}>
                    Erro de Autenticação
                </Typography>
                
                <Alert severity="error" sx={{ mb: 4, mt: 2, textAlign: "left" }}>
                    {getErrorMessage(error || "")}
                </Alert>
                
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRetry}
                    disabled={isLoading}
                    sx={{ 
                        backgroundColor: '#00579d',
                        mt: 2
                    }}
                >
                    {isLoading ? "Tentando novamente..." : "Tentar novamente"}
                </Button>
                
                <Typography variant="body2" sx={{ mt: 4, color: '#666' }}>
                    Se o problema persistir, entre em contato com o suporte técnico.
                </Typography>
            </Paper>
        </Container>
    );
} 