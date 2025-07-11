import HeroSection from "../components/HeroSection";
import NewArticles from "../components/NewArticles";
import BeatWritersComponent from "../components/BeatWritersComponent";
import PodcastsComponent from "../components/PodcastsComponent";
import FeedComponent from "../components/FeedComponent";
import SubscriptionComponent from "../components/SubscriptionComponent";
import DeliveredToComponent from "../components/DeliveredToComponent";
import TrendingPlayers from "../components/TrendingPlayers";









export default function Home() {
  return (
    <div>
      <HeroSection />
      <TrendingPlayers/>
      <NewArticles/>
      <PodcastsComponent/>
      <DeliveredToComponent/>
      <SubscriptionComponent/>
    </div>
  );
}``