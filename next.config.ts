import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/**" }]
      : [],
  },
  experimental: {
    // Uploads de imagem de produto (Fase 3) passam de sobra do 1MB padrão.
    serverActions: {
      bodySizeLimit: "15mb",
    },
    // O proxy.ts (auth) intercepta toda rota e, por padrão, só bufferiza
    // até 10MB do corpo — acima disso o upload é truncado *silenciosamente*.
    proxyClientMaxBodySize: "15mb",
  },
};

export default nextConfig;
