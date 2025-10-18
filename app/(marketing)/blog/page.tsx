import { allPosts } from "contentlayer/generated";
import { getTranslations, getLocale } from 'next-intl/server';

import { constructMetadata, getBlurDataURL } from "@/lib/utils";
import { BlogPosts } from "@/components/content/blog-posts";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = await getTranslations('marketing.blog');
  
  return constructMetadata({
    title: t('metadata.title'),
    description: t('metadata.description'),
    locale,
    pathname: '/blog',
  });
}

export default async function BlogPage() {
  const posts = await Promise.all(
    allPosts
      .filter((post) => post.published)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(async (post) => ({
        ...post,
        blurDataURL: await getBlurDataURL(post.image),
      })),
  );

  return <BlogPosts posts={posts} />;
}
