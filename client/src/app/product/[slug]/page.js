// app/Product/[slug]/page.js
import { productAPI } from "../../lib/product";
import ProductShowcasePage from '../../components/ProductShowcasePage';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API}/api/auth/product/${slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("API failed");

    const product = await res.json();

    const imageUrl =
      product.imageUrls?.[0]?.startsWith("http")
        ? product.imageUrls[0]
        : `${process.env.NEXT_PUBLIC_IMAGE_URL}${product.imageUrls?.[0]}`;
   console.log("OG Image URL:", imageUrl);
    return {
      title: product.name,
      description: product.description,

      openGraph: {
        title: product.name,
        description: product.description,
        url: `https://www.myastrova.com/product/${slug}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description,
        images: [imageUrl],
      },
    };
  } catch (err) {
    console.error("OG ERROR:", err);

    return {
      title: "MyAstrova",
      description: "Spiritual Products",
    };
  }
}
export default function ProductPage() {
  return <ProductShowcasePage />;
}