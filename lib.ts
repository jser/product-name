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

// Match → title and url
type RuleItem<T extends RegExpMatchArray = RegExpMatchArray> = ({
    match: (url: string) => T | null;
    url: ({ url, match }: { url: string; match: T }) => string;
});
type ReleaseRuleItem<T extends RegExpMatchArray = RegExpMatchArray> = {
    matchVersion: (url: string) => T | null;
    version: ({ url, match }: { url: string; match: T }) => string | undefined;
    tests: {
        input: string;
        output: string | undefined
    }[]
};
export const RELEASE_RULE: ReleaseRuleItem[] = [
    {
        matchVersion: (url: string) => {
            return url.match(
                /^https:\/\/github\.com\/(?<owner>[^/])+\/(?<repo>[^/])+\/releases\/tag\/(?<version>[^/]+)/
            );
        },
        version: ({ match }) => match?.groups?.version,
        tests: [{
            input: "https://github.com/webpack/webpack/releases/tag/v5.64.2",
            output: "v5.64.2"
        }],
    },
    {
        matchVersion: (url: string) => {
            return url.match(
                /^https:\/\/nodejs\.org\/(?<lang>[^/])+\/blog\/release\/(?<version>[^/]+)/
            );
        },
        version: ({ match }) => match?.groups?.version,
        tests: [{
            input: "https://nodejs.org/en/blog/release/v18.9.1/",
            output: "v18.9.1"
        }],
    },
    {
        matchVersion: (url: string) => {
            return url.match(
                /https:\/\/webkit\.org\/blog\/\d+\/release-notes-for-safari-technology-preview-(?<version>\d+)\//
            );
        },
        version: ({ match }) => match?.groups?.version,
        tests: [{
            input: "https://webkit.org/blog/13394/release-notes-for-safari-technology-preview-156/",
            output: "156"
        }],
    },
    {
        matchVersion: (url: string) => {
            return url.match(
                /https:\/\/eslint\.org\/blog\/([^/])+\/([^/])+\/eslint-v(?<version>[\d.]+)-released\//
            );
        },
        version: ({ match }) => `v${match?.groups?.version}`,
        tests: [{
            input: "https://eslint.org/blog/2022/08/eslint-v8.23.0-released/",
            output: "v8.23.0"
        }],
    },
    {
        matchVersion: (url: string) => {
            return url.match(
                /https:\/\/deno\.com\/blog\/v(?<version>[\d.]+)/
            );
        },
        version: ({ match }) => `v${match?.groups?.version}`,
        tests: [{
            input: "https://deno.com/blog/v1.19",
            output: "v1.19"
        }, {
            input: "https://deno.com/blog/fastest-git-deploys-to-the-edge",
            output: undefined
        }],
    },
];

const URL_RULES: RuleItem[] = [
    // GitHub
    {
        match: (url: string) => {
            return url.match(/https:\/\/github\.com\/(?<owner>[-\w]+)\/(?<name>[-\w]+)/);
        },
        url: ({ match }) => match[0],
    },
    // gist
    {
        match: (url: string) => {
            // https://gist.github.com/azu/xxx
            return url.match(/https:\/\/gist.github\.com\/(?<owner>[-\w]+)\//);
        },
        url: ({ match }) => match[0],
    },
    // Google+
    // https://plus.google.com/u/0/103969044621963378195/posts/af6Fg972tGQ
    {
        match: (url: string) => {
            return url.match(/https:\/\/plus\.google\.com\/\/u\/0\/(?<owner>[-\w]+)/);
        },
        url: ({ match }) => match[0]
    },
    // Google Group
    // https://groups.google.com/forum/#!msg/node-webkit/x7kYuDO0Cj8/cIxoJ6RFiLsJ
    {
        match: (url: string) => {
            return url.match(/https:\/\/groups\.google\.com\/forum\/#!msg\/(?<owner>[-\w]+)/);
        },
        url: ({ match }) => match[0]
    },
    // Google Group
    // https://groups.google.com/a/chromium.org/g/blink-dev/c/WXNzM0WiQ-s/m/l10NGhaoAQAJ
    {
        match: (url: string) => {
            return url.match(/https:\/\/groups\.google\.com\/g\/(?<owner>[-\w]+)/);
        },
        url: ({ match }) => match[0]
    },
    // Google Group
    // https://groups.google.com/a/chromium.org/g/blink-dev/c/WXNzM0WiQ-s/m/l10NGhaoAQAJ
    {
        match: (url: string) => {
            return url.match(/https:\/\/groups\.google\.com\/a\/(?<owner>[-\w]+)\/g\/(?<name>[-\w]+)/);
        },
        url: ({ match }) => match[0]
    },
    // Zenn
    {
        match: (url: string) => {
            return url.match(/https:\/\/zenn\.dev\/(?<name>[-\w]+)\//);
        },
        url: ({ match }) => match[0]
    },
    // qiita
    // https://qiita.com/koedamon/items/3e64612d22f3473f36a4
    {
        match: (url: string) => {
            return url.match(/https:\/\/qiita\.com\/(?<name>[-\w]+)\//);
        },
        url: ({ match }) => match[0]
    },
    // Note
    // https://note.com/takamoso/n/n32c4e6904cf7
    {
        match: (url: string) => {
            return url.match(/https:\/\/note\.com\/(?<name>[-\w+])\//);
        },
        url: ({ match }) => match[0]
    },
    // Medium
    // https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
    {
        match: (url: string) => {
            return url.match(/https:\/\/medium\.com\/(?<name>[-@\w]+)\//);
        },
        url: ({ match }) => match[0]
    },
    // https://dev.to
    // https://dev.to/voraciousdev/a-practical-guide-to-the-web-cryptography-api-4o8n
    {
        match: (url: string) => {
            return url.match(/https:\/\/dev\.to\/(?<name>[-\w]+)\//);
        },
        url: ({ match }) => match[0]
    },
    // speakerdeck
    // https://speakerdeck.com/jmblog
    {
        match: (url: string) => {
            return url.match(/https:\/\/speakerdeck\.com\/(?<name>[-\w]+)\//);
        },
        url: ({ match }) => match[0]
    },
    // slideshare
    // https://www2.slideshare.net/techblogyahoo
    {
        match: (url: string) => {
            return url.match(/https:\/\/(www\d)\.slideshare\.net\/(?<name>[-\w]+)\//);
        },
        url: ({ match }) => match[0]
    },

    //
];

const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
    list.reduce((previous, currentItem) => {
        const group = getKey(currentItem);
        if (!previous[group]) previous[group] = [];
        previous[group].push(currentItem);
        return previous;
    }, {} as Record<K, T[]>);

export const getUniqueUrl = (url: string) => {
    for (const rule of URL_RULES) {
        const matchRule = rule.match?.(url);
        if (matchRule) {
            return rule.url?.({ url, match: matchRule });
        }
    }
    // default
    const urlObject = new URL(url);
    return urlObject.origin;
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
export const getProductName = (releaseNotes: JserItem[]) => {
    const productRC = new Map<string, number>()
    const maxTry = Math.min(releaseNotes.length, 10);
    for (let i = 0; i < maxTry; i++) {
        const randomElement = releaseNotes[i];
        const firstLine = randomElement.content.split(/\n/)[0]
        // strict > loose
        const match = patternMatch(firstLine, [
            // Pure 0.6.0-rc-1リリース。
            // jQuery UI 1.13.0-rc.2リリース
            /(?<Product>.*?)\s?(?<Version>v?[\d.]{1,12}[-\s]?(!?RC|β|α|beta|alpha)[-\s.]?\d+)\s?リリース/i,
            // Nightwatch v2.0-alphaリリース
            /(?<Product>.*?)\s?(?<Version>v?[\d.]{1,12}[-\s]?(!?RC|ベータ|アルファ|β|α|beta|alpha))\s?リリース/i,
            // jQuery 1.0.0リリース
            /(?<Product>.*?)\s?(?<Version>v?[\d.]{1,12})\s?リリース/i,
        ]);
        if (match) {
            const product = match.groups?.Product as string;
            // ~ である<Product>
            // ~<Product>
            let stop = false;
            const productWithoutLead = product.split(/\b/).reverse().reduce((t, w) => {
                if (stop) {
                    return t;
                }
                if (/^[.\w\d\s-]+$/.test(w)) {
                    return w + t;
                }
                stop = true;
                return t;
            }, "").trim();
            productRC.set(productWithoutLead, (productRC.get(productWithoutLead) ?? 0) + 1)
        } else {
            // console.log("||||||||||||", firstLine);
        }
    }
    const sortedProductByCount = [...productRC.entries()].sort((a, b) => b[1] - a[1]);
    return sortedProductByCount?.[0]?.[0];
};
export const fetchItems = (): Promise<JserItem[]> => {
    return fetch("https://jser.info/source-data/items.json")
        .then(res => {
            if (!res.ok) {
                return Promise.reject(new Error("items.json: " + res.statusText));
            }
            return res.json();
        })
}

export const getReleaseNoteVersion = (currentUrl: string): string | undefined => {
    for (const rule of RELEASE_RULE) {
        const matchRule = rule.matchVersion?.(currentUrl);
        if (matchRule) {
            return rule.version?.({ url: currentUrl, match: matchRule });
        }
    }
    return;
}

export type Product = {
    name: string;
    url: string;
    // "v1.0.0" | optional
    releaseNoteVersion: string | undefined;
    // 0 - 1
    releaseNoteProbability: number;
}
export const getAllProducts = (items: JserItem[]): Omit<Product, "releaseNoteVersion">[] => {
    const groupByUrl = groupBy(items, item => {
        return getUniqueUrl(item.url);
    });
    return Object.entries(groupByUrl).flatMap(([origin, items]) => {
        const releaseNotes = items.filter(item => item.tags?.includes("ReleaseNote"))
        const releaseNoteProbability = (releaseNotes.length / items.length) || 0;
        if (releaseNotes.length === 0) {
            return []
        }
        return [{
            name: getProductName(releaseNotes),
            url: origin,
            releaseNoteProbability
        }];
    }).filter(p => Boolean(p.name));
}
