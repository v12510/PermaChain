/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });
    
    // 添加对wasm的支持
    config.experiments = { 
      asyncWebAssembly: true,
      layers: true 
    };
    
    return config;
  },
  images: {
    domains: ['storage.googleapis.com'], // 允许Google云存储图片
  },
};

export default nextConfig;