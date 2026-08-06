import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import ArticleDetail from "@/components/blog/ArticleDetail";
import PostBody from "@/components/blog/PostBody";
import Footer from "@/components/portfolio/Footer";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import SubHeader from "@/components/portfolio/SubHeader";
import { getPost } from "@/lib/blog/getPost";
import { getRelatedPosts } from "@/lib/blog/getRelatedPosts";
import { getPosts } from "@/lib/blog/getPosts";
import { getWordCount } from "@/lib/content/blog";
import { legalEntity } from "@/lib/portfolio/content";
import { toAbsoluteUrl } from "@/lib/site-url";
import { socialImage } from "@/lib/seo/metadata";

type Params = { slug: string };

// ISR: red horaria + invalidación inmediata por webhook (tag "blog").
export const revalidate = 3600;
// Artículos publicados en Sanity tras el deploy se renderizan al vuelo y se
// cachean, sin redeployar.
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Artículo no encontrado" };
  }

  // Overrides SEO del CMS; fallback a título/extracto del artículo.
  const title = `${post.seoTitle ?? post.title} · Blog Xync`;
  const description = post.seoDescription ?? post.excerpt;
  const pagePath = `/blog/${post.slug}`;
  const author = post.authorName ?? legalEntity.legalName;
  const ogImage = post.ogImage
    ? socialImage(post.ogImage.src, post.ogImage.alt || post.title)
    : socialImage(undefined, post.title);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: pagePath },
    openGraph: {
      type: "article",
      locale: "es_ES",
      siteName: "Xync",
      url: toAbsoluteUrl(pagePath),
      title,
      description,
      images: [ogImage],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [author],
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const post = await getPost(slug, preview);

  if (!post) {
    notFound();
  }

  const related = await getRelatedPosts(post.slug, preview);
  const pagePath = `/blog/${post.slug}`;
  const articleUrl = toAbsoluteUrl(pagePath);
  const author = post.authorName ?? legalEntity.legalName;
  const social = post.ogImage
    ? socialImage(post.ogImage.src, post.ogImage.alt || post.title)
    : socialImage(undefined, post.title);

  // BlogPosting conectado al grafo global de la entidad (layout.tsx emite
  // #person y #business en todas las páginas): autor Person real para E-E-A-T
  // y publisher Organization. mainEntityOfPage = URL canónica del artículo.
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${articleUrl}#article`,
    headline: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: "es",
    articleSection: post.category,
    wordCount: getWordCount(post),
    image: social.url,
    mainEntityOfPage: articleUrl,
    isPartOf: { "@id": `${toAbsoluteUrl("/blog")}#blog` },
    author: {
      "@type": "Person",
      "@id": `${toAbsoluteUrl("/")}#person`,
      name: author,
      url: toAbsoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      "@id": `${toAbsoluteUrl("/")}#business`,
      name: "Xync",
      url: toAbsoluteUrl("/"),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: toAbsoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: toAbsoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostingJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <PortfolioShell>
        <SubHeader />
        <main id="main-content" tabIndex={-1} aria-label={post.title}>
          <article>
            <ArticleDetail post={post} related={related}>
              <PostBody blocks={post.content} />
            </ArticleDetail>
          </article>
        </main>
        <Footer />
      </PortfolioShell>
    </>
  );
}
