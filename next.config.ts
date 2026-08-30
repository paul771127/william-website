import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 開發時允許同一個區網的裝置(手機)載入 dev 資源;正式部署不受影響
  allowedDevOrigins: [
    "192.168.1.202",
    "192.168.0.50",
    "192.168.5.3",
    "192.168.1.*",
    "192.168.0.*",
    "10.10.10.*",
  ],
};

export default nextConfig;
