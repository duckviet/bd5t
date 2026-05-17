import type { Metadata } from "next";

export const SITE_NAME = "Bản đồ 5 Tốt";

export const DEFAULT_DESCRIPTION =
  "Nền tảng số hỗ trợ sinh viên Trường Đại học Ngoại ngữ - ĐHQGHN tiếp cận, theo dõi và hoàn thành các tiêu chí của phong trào Sinh viên 5 Tốt.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const ORGANIZATION_NAME =
  "Trường Đại học Ngoại ngữ - Đại học Quốc gia Hà Nội";

export const DEFAULT_OG_IMAGE = "/fallback-cube-box.png";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL).toString();
}

type SeoMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function createMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: SeoMetadataOptions = {}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: SITE_NAME,
      title: title || SITE_NAME,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title || SITE_NAME,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}

export function truncateDescription(value?: string | null) {
  if (!value) {
    return DEFAULT_DESCRIPTION;
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 155) {
    return normalized;
  }

  return `${normalized.slice(0, 152).trim()}...`;
}
