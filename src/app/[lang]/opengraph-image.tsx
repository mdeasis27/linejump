import { ImageResponse } from "next/og";
import { dictionaries, isLang } from "../../i18n/dictionary";

export const alt = "Linejump";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const d = dictionaries[isLang(lang) ? lang : "en"];
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "#F7F2E8",
        color: "#14213D",
      }}
    >
      <div style={{ fontSize: 120, fontWeight: 800, display: "flex" }}>
        line<span style={{ color: "#B83A1B" }}>jump</span>
      </div>
      <div style={{ fontSize: 44, marginTop: 24, display: "flex" }}>{d.meta.oneLiner}</div>
    </div>,
    size,
  );
}
