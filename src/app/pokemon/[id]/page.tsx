import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { DetailSkeleton } from "@/features/pokemon/components/detail/detail-skeleton";
import { PokemonDetailView } from "@/features/pokemon/components/detail/pokemon-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * No paths at build time: each Pokémon page is rendered on its first visit
 * and then cached (ISR). That makes the route prefetchable, so opening a
 * Pokémon from the list is instant. The page itself is a thin shell — data
 * loads on the client from the static catalog and PokéAPI.
 */
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: /^\d+$/.test(id) ? `#${id.padStart(3, "0")}` : decodeURIComponent(id),
  };
}

export default async function PokemonPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <>
          <Header />
          <DetailSkeleton />
        </>
      }
    >
      <PokemonDetailView idParam={id} />
    </Suspense>
  );
}
