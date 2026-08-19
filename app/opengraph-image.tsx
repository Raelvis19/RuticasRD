import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";

export const alt = "Ruticas RD - Explora, conecta y vive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(
    new URL("../public/images/brand/logo-ruticas-icon.png", import.meta.url),
  );
  const logoDataUrl = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #07130f 0%, #0f5132 62%, #78a84a 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: 520,
            right: -150,
            top: -190,
            background: "rgba(190, 242, 100, 0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 340,
            height: 340,
            borderRadius: 340,
            right: 90,
            bottom: -230,
            background: "rgba(255, 255, 255, 0.10)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "70px 76px 66px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoDataUrl}
              width={112}
              height={112}
              alt=""
              style={{
                objectFit: "contain",
                borderRadius: 56,
                background: "white",
                padding: 5,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1 }}>
                Ruticas RD
              </span>
              <span style={{ marginTop: 5, fontSize: 20, color: "#bef264" }}>
                República Dominicana
              </span>
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}
          >
            <span
              style={{
                fontSize: 66,
                lineHeight: 1.04,
                fontWeight: 900,
                letterSpacing: -2.5,
              }}
            >
              Explora. Conecta. Vive.
            </span>
            <span
              style={{
                marginTop: 22,
                fontSize: 29,
                lineHeight: 1.35,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              Excursiones, naturaleza y aventuras inolvidables.
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              fontSize: 21,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 42,
                height: 5,
                borderRadius: 5,
                background: "#bef264",
              }}
            />
            www.ruticasrd.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
