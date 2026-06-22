import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mssql/tedious usan APIs de Node; se marcan como externos para que no se
  // intenten bundlear desde los route handlers.
  serverExternalPackages: ["mssql", "tedious"],
};

export default nextConfig;
