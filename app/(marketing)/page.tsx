import { Suspense } from "react";
import { getTranslations, getLocale } from 'next-intl/server';
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
  const locale = await getLocale();
  const t = await getTranslations('marketing.home');
  
  return constructMetadata({
    title: t('metadata.title'),
    description: t('metadata.description'),
    locale,
    pathname: '/',
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
