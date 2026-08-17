import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ruticas RD",
    short_name: "Ruticas RD",
    description:
      "Excursiones, senderos, naturaleza y aventuras en República Dominicana.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f6f3",
    theme_color: "#07130f",
    icons: [
      {
        src: "/images/brand/logo-ruticas-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
