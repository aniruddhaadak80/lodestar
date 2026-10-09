import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { Providers } from "@/lib/store";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: {
    default: "Lodestar — the AI safety reading room",
    template: "%s · Lodestar",
  },
  description:
    "Papers, essays, videos, podcasts and courses for AI safety researchers — searchable, structured by research area, with reading paths, notes and progress. Local-first.",
  keywords: ["AI safety", "alignment", "interpretability", "evals", "research library"],
  openGraph: {
    title: "Lodestar — the AI safety reading room",
    description: "Every paper, essay, video and course worth reading on AI safety, in one app.",
    type: "website",
  },
};

const themeScript = `
try {
  var s = JSON.parse(localStorage.getItem("lodestar:shelf:v1") || "{}");
  document.documentElement.dataset.theme = s.theme === "light" ? "light" : "dark";
} catch (e) { document.documentElement.dataset.theme = "dark"; }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
