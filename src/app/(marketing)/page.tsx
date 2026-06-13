import Hero from '@/components/Hero';
import ProblemSection from '@/components/ProblemSection';
import ActivityFeed from '@/components/ActivityFeed';
import HowItWorks from '@/components/HowItWorks';
import ScoreCard from '@/components/ScoreCard';
import ChallengesSection from '@/components/ChallengesSection';
import WhyYouth from '@/components/WhyYouth';
import WhyTrainers from '@/components/WhyTrainers';
import CTASection from '@/components/CTASection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <ActivityFeed />
      <HowItWorks />
      <ScoreCard />
      <ChallengesSection />
      <WhyYouth />
      <WhyTrainers />
      <CTASection />
    </>
  );
}
