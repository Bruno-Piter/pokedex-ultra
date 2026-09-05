export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#161616] px-6 text-center text-zinc-100">
      <h1 className="text-2xl font-semibold">Você está offline</h1>
      <p className="max-w-md text-sm text-zinc-400">
        O shell do app continua disponível. Reconecte para carregar dados da
        PokéAPI.
      </p>
    </main>
  );
}