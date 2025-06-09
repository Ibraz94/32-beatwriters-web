import HeroSection from "../components/HeroSection";
import NewArticles from "../components/NewArticles";
import BeatWritersComponent from "../components/BeatWritersComponent";
import PodcastsComponent from "../components/PodcastsComponent";






export default function Home() {
  return (
    <div>
      <HeroSection />
      <NewArticles/>
      <BeatWritersComponent/>
      <PodcastsComponent/>
    </div>
  );
}