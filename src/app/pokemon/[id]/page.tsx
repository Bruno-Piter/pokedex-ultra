import { Header } from "@/components/layout/header";
import { PokemonDetailView } from "@/features/pokemon/components/pokemon-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PokemonPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex h-screen max-h-[100dvh] flex-col overflow-hidden bg-mesh">
      <Header />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-safe">
        <PokemonDetailView id={id} />
      </div>
    </div>
  );
}
