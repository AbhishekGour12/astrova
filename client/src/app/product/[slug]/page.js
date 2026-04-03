// app/Product/[slug]/page.js
import { productAPI } from "../../lib/product";
import ProductShowcasePage from '../../components/ProductShowcasePage';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/auth/product/${slug}`, {
  cache: "no-store",
});

const product = await res.json();
console.log("Fetched product for metadata:", product);

    if (!product) {
      return {
        title: "Product Not Found | MyAstrova",
        description: "Product not found",
      };
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API || "https://yourdomain.com";
    const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

    let imageUrl = null;

    if (product.imageUrls?.length > 0) {
      const imagePath = product.imageUrls[0].startsWith("/")
        ? product.imageUrls[0].substring(1)
        : product.imageUrls[0];

      imageUrl = `${imageBaseUrl}${imagePath}`;
    }

    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = `${baseUrl}${imageUrl}`;
    }

    const productUrl = `${baseUrl}/product/${slug}`;

    return {
      title: product.name,
      description: product.description,

      openGraph: {
        title: product.name,
        description: product.description,
        url: productUrl,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
          },
        ],
      },
    };
  } catch (err) {
    return {
      title: "MyAstrova",
      description: "Spiritual Products",
    };
  }
}

export default function ProductPage() {
  return <ProductShowcasePage />;
}