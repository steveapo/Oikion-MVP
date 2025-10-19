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
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { NavMobile } from "@/components/layout/mobile-nav";

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

export default async function RootPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavMobile />
      <NavBar scroll={true} />
      <main className="flex-1">
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
      </main>
      <SiteFooter />
    </div>
  );
}
