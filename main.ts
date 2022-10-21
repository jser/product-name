import { serve } from "https://deno.land/std@0.126.0/http/server.ts";
import { fetchItems, getAllProductNames, getUniqueUrl } from "./lib.ts";

serve(async (req) => {
    const items = await fetchItems();
    const allNames = getAllProductNames(items);
    const targetUrl = new URL(req.url).searchParams.get("url");
    if (targetUrl) {
        const targetSearchUrl = getUniqueUrl(targetUrl);
        const targetProduct = allNames.find(product => targetSearchUrl === product.url);
        if (!targetProduct) {
            return new Response(null, {
                status: 400
            });
        }
        return new Response(JSON.stringify(targetProduct), {
            headers: { "content-type": "application/json" },
        });
    } else {
        return new Response(JSON.stringify(allNames), {
            headers: { "content-type": "application/json" },
        });
    }
});

console.log("http://localhost:8000")
