import { Suspense } from "react";
import { infos } from "@/config/landing";
import { constructMetadata } from "@/lib/utils";
import BentoGrid from "@/components/sections/bentogrid";
import Features from "@/components/sections/features";
import HeroLanding from "@/components/sections/hero-landing";
import InfoLanding from "@/components/sections/info-landing";
import Powered from "@/components/sections/powered";
import PreviewLanding from "@/components/sections/preview-landing";
import Testimonials from "@/components/sections/testimonials";
import { SessionErrorAlert } from "@/components/shared/session-error-alert";

export async function generateMetadata() {
  return constructMetadata({
    title: "Oikion - Real Estate CRM",
    description: "Modern real estate management platform for agents and agencies",
  });
}

export default function IndexPage() {
  return (
    <>
      <Suspense fallback={null}>
        <SessionErrorAlert />
      </Suspense>
      <HeroLanding />
      <PreviewLanding />
      <Powered />
      <BentoGrid />
      <InfoLanding data={infos[0]} reverse={true} />
      {/* <InfoLanding data={infos[1]} /> */}
      <Features />
      <Testimonials />
    </>
  );
}
