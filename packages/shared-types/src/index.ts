export interface ProductMetadata {
  prep_time_hours: number;
  same_day_cutoff: string;
  estimation_rules: string;
  gallery_images?: string[];
}

export interface DeliveryEstimate {
  eta_iso: string;
  eta_label: string;
  eta_range: string;
}

export interface OrderMetadata {
  eta_iso?: string;
  eta_label?: string;
  tags?: string[];
  delivery_time?: string;
  is_purmerend?: boolean;
  is_delivery?: boolean;
}

export interface PaymentMethod {
  id: string;
  label: string;
  available: boolean;
}

export interface BlogPost {
  id: number;
  // For backward compatibility with mock data
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  readingTime?: number;
  featured?: boolean;
  coverImage?: string | {
    url: string;
    alternativeText?: string;
  };
  author?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Strapi API response structure
  attributes?: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    category: 'recepten' | 'tips' | 'nieuws' | 'achter-de-schermen';
    readingTime?: number;
    featured?: boolean;
    coverImage?: {
      data?: {
        attributes?: {
          url: string;
          alternativeText?: string;
        };
      };
    };
    seo?: {
      title?: string;
      description?: string;
      ogImage?: {
        data?: {
          attributes?: {
            url: string;
          };
        };
      };
    };
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface PurmerendDetection {
  isPurmerend: boolean;
  reason: 'city' | 'postal_code' | 'none';
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}