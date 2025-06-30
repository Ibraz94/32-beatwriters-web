import HeroSection from "../components/HeroSection";
import NewArticles from "../components/NewArticles";
import BeatWritersComponent from "../components/BeatWritersComponent";
import PodcastsComponent from "../components/PodcastsComponent";
import FeedComponent from "../components/FeedComponent";
import SubscriptionComponent from "../components/SubscriptionComponent";








export default function Home() {
  return (
    <div>
      <HeroSection />
      <NewArticles/>
     
      {/* <BeatWritersComponent/> */}
      <PodcastsComponent/>
      {/* <FeedComponent/> */}
      <SubscriptionComponent/>
    </div>
  );
}``