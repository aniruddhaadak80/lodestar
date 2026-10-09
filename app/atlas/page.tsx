import type { Metadata } from "next";
import { AtlasView } from "@/components/atlas-view";

export const metadata: Metadata = {
  title: "Atlas",
  description: "The rooms of AI safety: research areas, their core questions, methods, people and papers.",
};

export default function AtlasPage() {
  return <AtlasView />;
}
