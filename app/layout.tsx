import type { Metadata } from "next";
import { Bitcount_Grid_Single, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// OS 라이트/다크 설정을 감지해 <html>에 `dark` 클래스를 토글합니다.
// `beforeInteractive`라 Next.js가 이 스크립트를 <head>에 넣고 하이드레이션 전에
// 실행해, 페인트 직전에 클래스가 결정되어 FOUC(다크→라이트 깜빡임)가 없습니다.
// `change` 리스너로 OS 설정이 실시간으로 바뀌면(라이트↔다크 전환) 앱도 같이 바뀝니다.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var mql = window.matchMedia("(prefers-color-scheme: dark)");
    var apply = function (isDark) {
      document.documentElement.classList.toggle("dark", isDark);
    };
    apply(mql.matches);
    mql.addEventListener("change", function (event) {
      apply(event.matches);
    });
  } catch (e) {}
})();
`;

// src/tokens/typography.css의 --font-sans(Inter)가 참조하는 실제 폰트.
// text-styles.css의 118개 텍스트 스타일 전부가 --font-sans를 쓰는데, 이 폰트가
// 로드되지 않으면 브라우저가 시스템 기본 sans-serif로 대체 렌더링해 Figma와
// 시각적으로 달라집니다. 이름 충돌을 피하려고 변수명은 --font-inter로 생성하고,
// typography.css에서 --font-sans가 이를 참조하도록 연결합니다.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// ProfilePrint/FloatingProfile 등 `.text-time-stamp`(src/tokens/text-styles.css)가
// 참조하는 Figma Text Style "Time Stamp"의 지정 폰트. 이 폰트가 로드되지 않으면
// 브라우저가 monospace로 대체 렌더링해 Figma와 시각적으로 달라 보입니다.
const bitcountGridSingle = Bitcount_Grid_Single({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-time-stamp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gabrielle",
  description: "Gabrielle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${bitcountGridSingle.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
