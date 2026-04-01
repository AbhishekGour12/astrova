// app/Product/[id]/page.js
import { productAPI } from "../../lib/product";
import ProductShowcasePage from '../../components/ProductShowcasePage';
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const product = await fetch(
      `${process.env.NEXT_PUBLIC_API}/products/${id}`,
      { cache: "no-store" }
    ).then(res => res.json());

    if (!product) {
      return {
        title: "Product Not Found",
        description: "Product not found",
      };
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}${product.imageUrls[0]}`;
    const productUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/Product/${id}`;

    return {
      title: `${product.name} | MyAstrova`,
      description: product.description?.slice(0, 160),

      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 160),
        url: productUrl,
        images: [imageUrl],
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description?.slice(0, 160),
        images: [imageUrl],
      },
    };
  } catch (err) {
    return {
      title: "MyAstrova",
      description: "Sacred Products",
    };
  }
}
export default function ProductPage({ params }) {
  // Your existing ProductShowcasePage component
  return <ProductShowcasePage params={params} />;
}