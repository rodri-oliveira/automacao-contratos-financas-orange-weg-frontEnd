import type { Metadata } from "next";
import React from "react";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "@/components/theme"

export const metadata: Metadata = {
    title: "automacao-financas-frontend",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AppRouterCacheProvider>
                    <ThemeProvider theme={theme}>
                        <CssBaseline>
                            {children}
                        </CssBaseline>
                    </ThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}