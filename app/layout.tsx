import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "初審申請表",
  description: "Pawnshop Application"
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
