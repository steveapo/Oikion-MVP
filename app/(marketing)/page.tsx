import { Suspense } from "react";
import { getTranslations, getLocale } from 'next-intl/server';
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
  const t = await getTranslations('home.metadata');
  
  return constructMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    pathname: '/',
  });
}

export default async function IndexPage() {
  const t = await getTranslations('home.info');
  
  // Construct info data from translations
  const infoSection1 = {
    title: t('section1.title'),
    description: t('section1.description'),
    image: "/_static/illustrations/work-from-home.jpg",
    list: [
      {
        title: t('section1.items.collaborative.title'),
        description: t('section1.items.collaborative.description'),
        icon: "laptop" as const,
      },
      {
        title: t('section1.items.efficient.title'),
        description: t('section1.items.efficient.description'),
        icon: "settings" as const,
      },
      {
        title: t('section1.items.scalable.title'),
        description: t('section1.items.scalable.description'),
        icon: "search" as const,
      },
    ],
  };

  return (
    <>
      <Suspense fallback={null}>
        <SessionErrorAlert />
      </Suspense>
      <HeroLanding />
      <PreviewLanding />
      <Powered />
      <BentoGrid />
      <InfoLanding data={infoSection1} reverse={true} />
      {/* <InfoLanding data={infos[1]} /> */}
      <Features />
      <Testimonials />
    </>
  );
}
