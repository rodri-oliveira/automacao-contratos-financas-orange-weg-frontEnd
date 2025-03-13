"use client";

import { Box, Button, Container, Paper, Typography, CircularProgress } from "@mui/material";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn("keycloak", { 
                callbackUrl: "/",
                redirect: true
            });
        } catch (error) {
            console.error("Erro ao fazer login:", error);
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h5" component="h1" gutterBottom sx={{ color: '#00579d' }}>
                    Automação Financeira
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 4 }}>
                    Faça login com sua conta WEG para acessar o sistema
                </Typography>
                
                <Button
                    variant="contained"
                    onClick={handleLogin}
                    disabled={isLoading}
                    sx={{ 
                        backgroundColor: '#00579d',
                        '&:hover': {
                            backgroundColor: '#004a84'
                        }
                    }}
                >
                    {isLoading ? (
                        <>
                            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                            Autenticando...
                        </>
                    ) : (
                        "Entrar com WEG ID"
                    )}
                </Button>
            </Paper>
        </Container>
    );
}