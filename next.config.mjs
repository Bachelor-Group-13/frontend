import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  register: true,
});

export default withSerwist({
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
});
