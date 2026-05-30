import { notFound } from 'next/navigation';
import { ProductService } from '@/lib/Services/admin/ProductService';
import ProductDetailClient from './ProductDetailClient';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const product = await ProductService.getProductBySlug(resolvedParams.slug);
    if (!product) return { title: 'Product Not Found' };

    const title = product.seoTitle || `${product.name} | NextShop`;
    const description = product.seoDescription || product.description.substring(0, 160);
    const imageUrl = product.thumbnail?.url || product.images?.[0]?.url || '';
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/product/${product.slug}`;

    return {
      title,
      description,
      keywords: [product.name, product.brand, (product.categoryId as any)?.name, "buy online", "ecommerce"].filter(Boolean).join(", "),
      openGraph: {
        title,
        description,
        url,
        type: 'website',
        siteName: 'NextShop',
        images: imageUrl ? [
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: product.name,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
      alternates: {
        canonical: url,
      }
    };
  } catch (error) {
    return { title: 'Product Not Found' };
  }
}

export const revalidate = 60;

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  let product;
  let relatedProducts = [];
  
  try {
    const productData = await ProductService.getProductBySlug(resolvedParams.slug);
    if (!productData) {
      return notFound();
    }
    product = JSON.parse(JSON.stringify(productData));

    const relatedData = await ProductService.getRelatedProducts(product.categoryId._id, product._id);
    relatedProducts = JSON.parse(JSON.stringify(relatedData));
  } catch (error) {
    console.error("Product Page Fetch Error:", error);
    return notFound();
  }

  // Generate JSON-LD Structured Data for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.thumbnail?.url || product.images?.[0]?.url,
    description: product.seoDescription || product.description,
    sku: product.sku || product._id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'NextShop',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/product/${product.slug}`,
      priceCurrency: 'PKR',
      price: product.discountPrice || product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.totalQty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
