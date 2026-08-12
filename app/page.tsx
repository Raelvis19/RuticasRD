import FeaturedToursSection from "@/components/home/FeaturedToursSection";
import GalleryPreviewSection from "@/components/home/GalleryPreviewSection";
import HeroSection from "@/components/home/HeroSection";
import ReservationLookupSection from "@/components/home/ReservationLookupSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ReservationLookupSection />
      <FeaturedToursSection />
      <GalleryPreviewSection />
    </main>
  );
}
