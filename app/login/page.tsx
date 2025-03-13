"use client";

import { Box, Button, Grid, Paper, Typography, CircularProgress } from "@mui/material";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        setIsLoading(true);
        // Usar signIn do client-side
        await signIn("keycloak", { callbackUrl: "/" });
    };

    return (
        <Grid
            container
            component="main"
            sx={{
                height: "100vh"
            }}
        >
            <Grid
                item
                square
                xs={12}
                sm={6}
                md={4}
                component={Paper}
                elevation={6}
            >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 5 }}>
                    <Typography component="h1" variant="h4" mb={8}>
                        {"automacao-financas-frontend"}
                    </Typography>
                    
                    <Button 
                        variant="contained" 
                        onClick={handleSignIn}
                        disabled={isLoading}
                        sx={{ minWidth: 120 }}
                    >
                        {isLoading ? (
                            <>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                Aguarde...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </Box>
            </Grid>

            <Grid
                item
                xs={false}
                sm={6}
                md={8}
                sx={{
                    backgroundColor: "#00579d",
                }}
            />
        </Grid>
    );
}