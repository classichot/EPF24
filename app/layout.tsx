import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EPF24 — Provident Fund Intelligence",
  description:
    "EPF24 makes the provident-fund market transparent, competitive and liquid. Make every baht and every basis point compete.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
