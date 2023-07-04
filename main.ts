import { serve } from "https://deno.land/std@0.126.0/http/server.ts";
import { fetchItems, getAllProducts, getReleaseNoteVersion, getUniqueUrl, Product } from "./lib.ts";

await serve(async (req) => {
    const items = await fetchItems();
    const allProducts = getAllProducts(items);
    const targetUrl = new URL(req.url).searchParams.get("url");
    if (targetUrl) {
        const targetSearchUrl = getUniqueUrl(targetUrl);
        const targetProduct = allProducts.find((product) => targetSearchUrl === product.url);
        if (!targetProduct) {
            return new Response("Not Found this product", {
                status: 404,
            });
        }
        const targetReleaseNoteVersion = getReleaseNoteVersion(targetUrl);
        const resultProduct: Product = {
            ...targetProduct,
            releaseNoteVersion: targetReleaseNoteVersion,
        };
        return new Response(JSON.stringify(resultProduct), {
            headers: { "content-type": "application/json" },
        });
    } else {
        return new Response(JSON.stringify(allProducts), {
            headers: { "content-type": "application/json" },
        });
    }
});

console.log("http://localhost:8000");
