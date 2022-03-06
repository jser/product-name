import { serve } from "https://deno.land/std@0.126.0/http/server.ts";

export interface JserItem {
    title: string;
    url: string;
    content: string;
    date: string;
    tags?: string[];
    relatedLinks?: RelatedLinksItem[];
    viaURL?: string | null;
}

export interface RelatedLinksItem {
    title: string;
    url: string;
}

const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
    list.reduce((previous, currentItem) => {
        const group = getKey(currentItem);
        if (!previous[group]) previous[group] = [];
        previous[group].push(currentItem);
        return previous;
    }, {} as Record<K, T[]>);

const getUniqueUrl = (urlS: string) => {
    const url = new URL(urlS);
    const host = url.host;
    const repo = url.pathname.split("/").slice(0, 2).join("/");
    return host === "github.com" ? host + repo : host;
}
const patternMatch = (str: string, regexps: RegExp[]) => {
    for (const regExp of regexps) {
        const match = str.match(regExp);
        if (match) {
            return {
                groups: match.groups,
                regExp
            }
        }
    }
    return null;
}
const getPhase = (releaseNotes: JserItem[]) => {
    const productRC = new Map<string, number>()
    const maxTry = Math.min(releaseNotes.length, 10);
    for (let i = 0; i < maxTry; i++) {
        const randomElement = releaseNotes[i];
        const firstLine = randomElement.content.split(/\n/)[0]
        // strict > loose
        const match = patternMatch(firstLine, [
            //  Pure 0.6.0-rc-1リリース。
            /(?<Product>.*?)\s?(?<Version>v?[\d.]{1,12}[-\s]?(!?RC|β|α|beta|alpha)[-\s]?\d+)\s?リリース/i,
            // Nightwatch v2.0-alphaリリース
            /(?<Product>.*?)\s?(?<Version>v?[\d.]{1,12}[-\s]?(!?RC|ベータ|アルファ|β|α|beta|alpha))\s?リリース/i,
            // jQuery 1.0.0リリース
            /(?<Product>.*?)\s?(?<Version>v?[\d.]{1,12})\s?リリース/i,
        ]);
        if (match) {
            const product = match.groups?.Product as string;
            // ~ である<Product>
            // ~<Product>
            let stop = false
            console.log("&: ", product);
            console.log(">>>>>>>>", firstLine);
            console.log(">>>>>>>>", match.regExp);
            const productWithoutLead = product.split(/\b/).reverse().reduce((t, w) => {
                if (stop) {
                    return t;
                }
                if (/^[.\w\d\s-]+$/.test(w)) {
                    return w + t;
                }
                stop = true;
                return t;
            }, "").trim()
            productRC.set(productWithoutLead, (productRC.get(productWithoutLead) ?? 0) + 1)
        } else {
            // console.log("||||||||||||", firstLine);
        }
    }
    const sortedProductByCount = [...productRC.entries()].sort((a, b) => b[1] - a[1]);
    return sortedProductByCount?.[0]?.[0];
};
serve(async (_req) => {
    const fetchItems = (): Promise<JserItem[]> => {
        return fetch("https://jser.info/source-data/items.json")
            .then(res => {
                if (!res.ok) {
                    return Promise.reject(new Error("items.json: " + res.statusText));
                }
                return res.json();
            })
    }
    const items = await fetchItems();
    const allReleaseNotes = items.filter(item => item.tags?.includes("ReleaseNote"));
    const groupByReleaseNote = groupBy(allReleaseNotes, item => {
        return getUniqueUrl(item.url);
    });
    const p = Object.values(groupByReleaseNote).map(releaseNotes => {
        return getPhase(releaseNotes);
    }).filter(Boolean);
    return new Response(JSON.stringify(p), {
        headers: { "content-type": "application/json" },
    });
});
