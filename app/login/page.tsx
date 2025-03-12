import { signIn } from "@/app/auth"
import { Box, Button, Grid, Paper, Typography } from "@mui/material"

export default function LoginPage() {
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
                    <form
                        action={async () => {
                            "use server"
                            await signIn("keycloak", { redirectTo: "/" })
                        }}
                    >
                        <Button variant="contained" type="submit">Sign In</Button>
                    </form>
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
    )
}