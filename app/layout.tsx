import "./globals.css";

export const metadata = {
  title: "Trend Radar",
  description: "사람들의 마음이 움직이는 방향을 읽다",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
