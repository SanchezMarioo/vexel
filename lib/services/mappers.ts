import "server-only";
import type { BlogBlock } from "@/lib/content/blog";
import { mapPortableTextToBlocks } from "@/lib/blog/portable-text";
import { urlForOgImage } from "@/sanity/image";
import type { SanityImageSource, SanityServiceCard, SanityServiceFull } from "@/sanity/types";

export interface ServicePage {
  slug: string;
  title: string;
  updatedAt?: string;
  seoTitle?: string;
  metaDescription: string;
  hero: {
    eyebrow?: string;
    title?: string;
    text?: string;
    image?: { src: string; alt: string; width: number; height: number; blurDataURL?: string };
  } | null;
  content: BlogBlock[];
  faq: Array<{ question: string; answer: string }>;
  cta: { title: string; text: string; label: string; href: string };
  ogImage?: { src: string; alt: string; width: number; height: number };
}

const DEFAULT_CTA = {
  title: "¿Hablamos de tu proyecto?",
  text: "Cuéntanos qué necesitas y te damos una propuesta clara, con precio y plazo cerrados.",
  label: "Cuéntanos tu caso",
  href: "/#contacto",
};

function mapImage(image?: { url: string; alt: string; width: number; height: number; lqip?: string }) {
  if (!image?.url || !image.width || !image.height) return undefined;
  return {
    src: image.url,
    alt: image.alt,
    width: image.width,
    height: image.height,
    ...(image.lqip ? { blurDataURL: image.lqip } : {}),
  };
}

function mapOgImage(image?: SanityImageSource | null) {
  if (!image?.asset?._ref) return undefined;
  return {
    src: urlForOgImage({
      _type: "image",
      asset: image.asset,
      crop: image.crop,
      hotspot: image.hotspot,
    }),
    alt: image.alt,
    width: 1200,
    height: 630,
  };
}

export function mapSanityService(service: SanityServiceFull): ServicePage {
  const heroImage = mapImage(service.hero?.image);
  const ogImage = mapOgImage(service.ogImage);

  return {
    slug: service.slug,
    title: service.title,
    ...(service.updatedAt ? { updatedAt: service.updatedAt } : {}),
    ...(service.seoTitle ? { seoTitle: service.seoTitle } : {}),
    metaDescription: service.metaDescription,
    hero: service.hero
      ? {
          ...(service.hero.eyebrow ? { eyebrow: service.hero.eyebrow } : {}),
          ...(service.hero.title ? { title: service.hero.title } : {}),
          ...(service.hero.text ? { text: service.hero.text } : {}),
          ...(heroImage ? { image: heroImage } : {}),
        }
      : null,
    content: mapPortableTextToBlocks(service.content),
    faq: service.faq ?? [],
    cta:
      service.cta?.title && service.cta.text && service.cta.label && service.cta.href
        ? {
            title: service.cta.title,
            text: service.cta.text,
            label: service.cta.label,
            href: service.cta.href,
          }
        : DEFAULT_CTA,
    ...(ogImage ? { ogImage } : {}),
  };
}

export function mapSanityServiceCard(service: SanityServiceCard) {
  return { slug: service.slug, title: service.title, updatedAt: service.updatedAt };
}
