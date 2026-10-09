import { Suspense } from "react";
import type { Metadata } from "next";
import { LibraryClient } from "@/components/library-client";

export const metadata: Metadata = {
  title: "Library",
  description: "Every AI safety paper, essay, video, podcast and course — searchable and filterable.",
};

export default function LibraryPage() {
  return (
    <Suspense>
      <LibraryClient />
    </Suspense>
  );
}
