// app/Product/[slug]/page.js
import { productAPI } from "../../lib/product";
import ProductShowcasePage from '../../components/ProductShowcasePage';

export async function generateMetadata({ params }) {
  const { slug } = params;

  try {
    // Use your existing productAPI to fetch the product
    const product = await productAPI.getProductById(slug);
    
    if (!product) {
      return {
        title: "Product Not Found | MyAstrova",
        description: "Product not found",
      };
    }

    // Get absolute URLs
    const baseUrl = process.env.NEXT_PUBLIC_API || 'https://yourdomain.com';
    const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL;
    
    // Construct absolute image URL
    let imageUrl = null;
    if (product.imageUrls && product.imageUrls.length > 0) {
      // Remove any leading slashes to avoid double slashes
      const imagePath = product.imageUrls[0].startsWith('/') 
        ? product.imageUrls[0].substring(1) 
        : product.imageUrls[0];
      imageUrl = `${imageBaseUrl}${imagePath}`;
    }
    
    // Ensure image URL is absolute
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${baseUrl}${imageUrl}`;
    }
    
    const productUrl = `${baseUrl}/product/${slug}`;
    const price = product.discountedPrice || product.price;
    
    console.log('Generated metadata:', { imageUrl, productUrl, baseUrl, imageBaseUrl }); // Debug log

    return {
      title: `${product.name} | MyAstrova`,
      description: product.description?.slice(0, 160),
      
      // Open Graph meta tags
      openGraph: {
        title: `${product.name} | MyAstrova`,
        description: `✨ ${product.name} - ${product.description?.slice(0, 120)}... ⭐ ${product.rating || 0}★ | ₹${price}`,
        url: productUrl,
        siteName: 'MyAstrova',
        images: imageUrl ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
            secureUrl: imageUrl,
          }
        ] : [
          {
            url: `${baseUrl}/og-default-image.jpg`, // Add a default image
            width: 1200,
            height: 630,
            alt: 'MyAstrova',
          }
        ],
        type: 'product',
        locale: 'en_IN',
      },
      
      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description?.slice(0, 200),
        images: imageUrl ? [imageUrl] : [`${baseUrl}/og-default-image.jpg`],
        site: '@MyAstrova',
        creator: '@MyAstrova',
      },
      
      // Additional meta tags for better compatibility
      other: {
        'og:image:alt': product.name,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:price:amount': price,
        'og:price:currency': 'INR',
        'og:availability': product.stock > 0 ? 'instock' : 'outofstock',
        'product:brand': 'MyAstrova',
        'product:retailer_item_id': product._id,
        'twitter:image:alt': product.name,
      },
      
      // For better SEO
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      
      alternates: {
        canonical: productUrl,
      },
    };
  } catch (err) {
    console.error("Metadata generation error:", err);
    return {
      title: "MyAstrova - Sacred Spiritual Products",
      description: "Discover authentic spiritual and sacred products for your spiritual journey",
    };
  }
}

export default function ProductPage() {
  return <ProductShowcasePage />;
}