"use client";

import { IconButton } from "@mui/material";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutButton() {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleLogout = async () => {
        setIsLoading(true);
        await signOut({ callbackUrl: "/login" });
    };
    
    return (
        <IconButton 
            onClick={handleLogout}
            disabled={isLoading}
            sx={{ 
                color: "#fff",
                padding: '4px'
            }}
            size="small"
            aria-label="Sair"
        >
            <ExitToAppIcon fontSize="small" />
        </IconButton>
    );
} 