import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { GalleryContent } from "@/components/gallery/gallery-content";
import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageContainer>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
        <GalleryContent />
      </Suspense>
    </PageContainer>
  );
}
