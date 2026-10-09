import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ITEMS, ITEM_BY_ID } from "@/lib/data";
import { ItemView } from "@/components/item-view";

export function generateStaticParams() {
  return ITEMS.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = ITEM_BY_ID[id];
  if (!item) return { title: "Not found" };
  return {
    title: item.title,
    description: item.deck,
  };
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = ITEM_BY_ID[id];
  if (!item) notFound();
  return <ItemView item={item} all={ITEMS} />;
}
