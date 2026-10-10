import { fetchItems, getAllProducts, getReleaseNoteVersion, getUniqueUrl } from "./lib.ts";
import type { Product } from "./lib.ts";

const handleRequest = async (req: Request): Promise<Response> => {
    const items = await fetchItems();
    const allProducts = getAllProducts(items);
    const targetUrl = new URL(req.url).searchParams.get("url");
    if (targetUrl) {
        const targetSearchUrl = getUniqueUrl(targetUrl);
        const targetProduct = allProducts.find((product) => targetSearchUrl === product.url);
        if (!targetProduct) {
            return new Response("null", {
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
};

export default {
    fetch: handleRequest,
};
