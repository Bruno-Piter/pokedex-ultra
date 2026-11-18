import { Header } from "@/components/layout/header";
import { DetailSkeleton } from "@/features/pokemon/components/detail/detail-skeleton";

export default function Loading() {
  return (
    <>
      <Header />
      <DetailSkeleton />
    </>
  );
}
