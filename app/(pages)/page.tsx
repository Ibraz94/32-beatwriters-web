export const dynamic = 'force-dynamic'

import LatestNuggets from "../components/LatestNuggets";
import NewArticles from "../components/NewArticles";
import BeatWritersComponent from "../components/BeatWritersComponent";
import PodcastsComponent from "../components/PodcastsComponent";
import FeedComponent from "../components/FeedComponent";
import SubscriptionComponent from "../components/SubscriptionComponent";
import DeliveredToComponent from "../components/DeliveredToComponent";
import TrustedByPartners from "../components/TrustedByComponent";
import Hero from "../components/Hero";







export default function Home() {
  return (
    <div>
      {/* <Hero /> */}
      <LatestNuggets />
      <TrustedByPartners />
      <NewArticles />
      <PodcastsComponent />
      <SubscriptionComponent />
    </div>
  );
} ``