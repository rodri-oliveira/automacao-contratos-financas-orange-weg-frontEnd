/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    // Configuração para URLs externas
    async redirects() {
        return [
            {
                source: '/api/auth/signin',
                destination: '/login',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
