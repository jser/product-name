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

// Match →　title and url
type RuleItem<T extends RegExpMatchArray = RegExpMatchArray> = {
    match: (item: JserItem) => T | null;
    // title: ({ item, match }: { item: JserItem; match: T }) => string;
    url: ({ item, match }: { item: JserItem; match: T }) => string;
};
const URL_RULES: RuleItem[] = [
    // GitHub
    {
        match: (item: JserItem) => {
            return item.url.match(/https:\/\/github\.com\/(?<owner>[-\w]+)\/(?<name>[-\w]+)/);
        },
        url: ({ match }) => match[0]
    },
    // Google Group
    // https://groups.google.com/forum/#!msg/node-webkit/x7kYuDO0Cj8/cIxoJ6RFiLsJ
    {
        match: (item: JserItem) => {
            return item.url.match(/https:\/\/groups\.google\.com\/forum\/#!msg\/(?<owner>[-\w]+)/);
        },
        url: ({ match }) => match[0]
    },
    // Google Group
    // https://groups.google.com/a/chromium.org/g/blink-dev/c/WXNzM0WiQ-s/m/l10NGhaoAQAJ
    {
        match: (item: JserItem) => {
            return item.url.match(/https:\/\/groups\.google\.com\/g\/(?<owner>[-\w]+)/);
        },
        url: ({ match }) => match[0]
    },
    // Google Group
    // https://groups.google.com/a/chromium.org/g/blink-dev/c/WXNzM0WiQ-s/m/l10NGhaoAQAJ
    {
        match: (item: JserItem) => {
            return item.url.match(/https:\/\/groups\.google\.com\/a\/(?<owner>[-\w]+)\/g\/(?<name>[-\w]+)/);
        },
        url: ({ match }) => match[0]
    },
    // Zenn
    {
        match: (item: JserItem) => {
            return item.url.match(/https:\/\/zenn\.dev\/(?<name>[-\w]+)\//);
        },
        url: ({ match }) => match[0]
    },
    // qiita
    // https://qiita.com/koedamon/items/3e64612d22f3473f36a4
    {
        match: (item: JserItem) => {
            return item.url.match(/https:\/\/qiita\.com\/(?<name>[-\w]+)\//);
        },
        url: ({ match }) => match[0]
    },
    // Note
    // https://note.com/takamoso/n/n32c4e6904cf7
    {
        match: (item: JserItem) => {
            return item.url.match(/https:\/\/note\.com\/(?<name>[-\w+])\//);
        },
        url: ({ match }) => match[0]
    },
    // Medium
    // https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
    {
        match: (item: JserItem) => {
            return item.url.match(/https:\/\/medium\.com\/(?<name>[-@\w]+)\//);
        },
        url: ({ match }) => match[0]
    },
    // https://dev.to
    // https://dev.to/voraciousdev/a-practical-guide-to-the-web-cryptography-api-4o8n
    {
        match: (item: JserItem) => {
            return item.url.match(/https:\/\/dev\.to\/(?<name>[-\w]+)\//);
        },
        url: ({ match }) => match[0]
    },
    // speakerdeck
    // https://speakerdeck.com/jmblog
    {
        match: (item: JserItem) => {
            return item.url.match(/https:\/\/speakerdeck\.com\/(?<name>[-\w]+)\//);
        },
        url: ({ match }) => match[0]
    },
    // slideshare
    // https://www2.slideshare.net/techblogyahoo
    {
        match: (item: JserItem) => {
            return item.url.match(/https:\/\/(www\d)\.slideshare\.net\/(?<name>[-\w]+)\//);
        },
        url: ({ match }) => match[0]
    }
];

const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
    list.reduce((previous, currentItem) => {
        const group = getKey(currentItem);
        if (!previous[group]) previous[group] = [];
        previous[group].push(currentItem);
        return previous;
    }, {} as Record<K, T[]>);

const getUniqueUrl = (item: JserItem) => {
    for (const rule of URL_RULES) {
        const matchRule = rule.match(item);
        if (matchRule) {
            return rule.url({ item, match: matchRule });
        }
    }
    // default
    const url = new URL(item.url);
    return url.origin;
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
const getProductName = (releaseNotes: JserItem[]) => {
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
            console.log(">>>>>>>>", releaseNotes[0]);
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
        return getUniqueUrl(item);
    });
    const p = Object.entries(groupByReleaseNote).map(([origin, releaseNotes]) => {
        return {
            name: getProductName(releaseNotes),
            url: origin
        };
    }).filter(p => Boolean(p.name));
    return new Response(JSON.stringify(p), {
        headers: { "content-type": "application/json" },
    });
});
