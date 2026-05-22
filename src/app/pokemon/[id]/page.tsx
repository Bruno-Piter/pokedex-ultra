import { Header } from "@/components/layout/header";
import { PokemonDetailView } from "@/features/pokemon/components/pokemon-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PokemonPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-mesh">
      <Header />
      <PokemonDetailView id={id} />
    </div>
  );
}
