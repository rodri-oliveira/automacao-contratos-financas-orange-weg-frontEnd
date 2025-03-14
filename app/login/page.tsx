"use client";

import { Box, Button, Grid, Paper, Typography, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleSignIn = async () => {
        setIsLoading(true);
        await signIn("keycloak", { callbackUrl: "/" });
    };

    return (
        <Grid
            container
            component="main"
            sx={{
                height: "100vh",
                overflow: "hidden"
            }}
        >
            {/* Formulário de login */}
            <Grid
                item
                xs={12}
                sm={6}
                md={4}
                component={Paper}
                elevation={6}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <Box sx={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    p: { xs: 3, sm: 5 },
                    height: '100%',
                    justifyContent: 'center'
                }}>
                    {/* Logo WEG */}
                    <Box sx={{ mb: 4, width: '70%', maxWidth: 200 }}>
                        <Box 
                            component="img" 
                            src="/images/weg-logo.png" 
                            alt="WEG Logo"
                            sx={{ 
                                width: '100%',
                                height: 'auto',
                                objectFit: 'contain'
                            }}
                            onError={(e) => {
                                // Fallback se a imagem não for encontrada
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    </Box>

                    <Typography 
                        component="h1" 
                        variant="h4" 
                        mb={2}
                        sx={{ 
                            color: '#00579d',
                            fontWeight: 600,
                            textAlign: 'center'
                        }}
                    >
                        Automação Financeira
                    </Typography>
                    
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            mb: 4, 
                            textAlign: 'center',
                            color: 'text.secondary'
                        }}
                    >
                        Acesse o sistema com sua conta corporativa
                    </Typography>
                    
                    <Button 
                        variant="contained" 
                        onClick={handleSignIn}
                        disabled={isLoading}
                        size="large"
                        sx={{ 
                            minWidth: 200,
                            py: 1.5,
                            backgroundColor: '#00579d',
                            '&:hover': {
                                backgroundColor: '#004a84'
                            },
                            borderRadius: 1.5,
                            boxShadow: 2
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
                    
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            mt: 4, 
                            color: 'text.secondary',
                            textAlign: 'center'
                        }}
                    >
                        © {new Date().getFullYear()} WEG S.A. Todos os direitos reservados.
                    </Typography>
                </Box>
            </Grid>

            {/* Imagem de fundo / Banner */}
            <Grid
                item
                xs={false}
                sm={6}
                md={8}
                sx={{
                    backgroundColor: "#00579d",
                    backgroundImage: 'url(/images/login-background.jpg)',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: { xs: 'none', sm: 'block' },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 87, 157, 0.85)',
                        zIndex: 0
                    }
                }}
            >
                <Box sx={{ 
                    position: 'relative', 
                    zIndex: 1, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 5,
                    color: 'white'
                }}>
                    <Typography 
                        variant="h3" 
                        component="h2" 
                        sx={{ 
                            fontWeight: 700,
                            mb: 3,
                            textAlign: 'center'
                        }}
                    >
                        Bem-vindo ao Sistema de Automação Financeira
                    </Typography>
                    
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            maxWidth: 600,
                            textAlign: 'center',
                            opacity: 0.9
                        }}
                    >
                        Gerencie contratos e processos financeiros com eficiência e segurança
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    );
}