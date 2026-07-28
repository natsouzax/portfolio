import { ImageResponse } from "next/og";

export const alt = "Natan Oliveira — Produtos digitais, pensados por inteiro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "72px",
          background: "#070907",
          color: "#f0f4e9",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0",
            display: "flex",
            background:
              "radial-gradient(circle at 82% 18%, rgba(200,255,112,.18), transparent 38%), linear-gradient(180deg, #0b0e0b, #070907)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "55px",
            right: "60px",
            display: "flex",
            width: "370px",
            height: "370px",
            border: "1px solid rgba(240,244,233,.14)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            border: "1px solid rgba(240,244,233,.16)",
            borderRadius: "34px",
            padding: "48px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                border: "1px solid rgba(240,244,233,.22)",
                borderRadius: "14px",
                color: "#c8ff70",
                fontSize: "15px",
              }}
            >
              NO
            </div>
            <div style={{ display: "flex", fontSize: "20px", fontWeight: 700 }}>
              Natan Oliveira
            </div>
            <div
              style={{
                display: "flex",
                width: "9px",
                height: "9px",
                marginLeft: "auto",
                borderRadius: "50%",
                background: "#c8ff70",
              }}
            />
            <div style={{ display: "flex", color: "#b0b8aa", fontSize: "15px" }}>
              workspace online
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                maxWidth: "850px",
                fontSize: "76px",
                fontWeight: 600,
                letterSpacing: "-4px",
                lineHeight: 0.98,
              }}
            >
              Produtos digitais,
              <br />
              pensados por inteiro.
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "26px",
                color: "#b0b8aa",
                fontSize: "21px",
              }}
            >
              Produto · Experiência · Engenharia
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
