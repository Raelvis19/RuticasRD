import FeaturedToursSection from "@/components/home/FeaturedToursSection";
import GalleryPreviewSection from "@/components/home/GalleryPreviewSection";
import HeroSection from "@/components/home/HeroSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedToursSection />
      <GalleryPreviewSection />
    </main>
  );
}