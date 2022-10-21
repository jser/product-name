import { assert, assertEquals, fail } from "https://deno.land/std@0.130.0/testing/asserts.ts";
import { getProductName, getReleaseNoteVersion, RELEASE_RULE } from "./lib.ts";

Deno.test("getProductName - {name} {ver}リリース", () => {
    const name = getProductName([
        {
            date: "2021-10-17T15:48:46.120Z",
            title: "Nuxt - Introducing Nuxt 3 Beta",
            url: "https://nuxtjs.org/announcements/nuxt3-beta/",
            content:
                "Nuxt 3 betaリリース。\nVue 3とViteへの対応。\n新しいサーバエンジンのNitro Engineを導入することで、通常のNode.jsサーバ、Serverless、Service Wo...",
            tags: ["Vue", "Next.js", "ReleaseNote"],
            relatedLinks: [],
        },
        {
            date: "2022-04-24T12:46:38.269Z",
            title: "Nuxt - Announcing Nuxt 3 Release Candidate",
            url: "https://nuxtjs.org/announcements/nuxt3-rc/",
            content: "Nuxt 3 RCリリース。\nVue 3、TypeScript、Viteのサポート。\nサーバーエンジンのNitroとポータブルな出力の対応など",
            tags: ["Vue", "library", "ReleaseNote"],
            relatedLinks: [],
        },
    ]);
    assertEquals(name, "Nuxt");
});
Deno.test("getProductName - {name} {ver}-alpha|betaリリース", () => {
    const name = getProductName([
        {
            date: "2022-01-29T14:18:59.905Z",
            title: "Release v2.0.0 · nightwatchjs/nightwatch",
            url: "https://github.com/nightwatchjs/nightwatch/releases/tag/v2.0.0",
            content:
                "Nightwatch 2.0リリース。\nPlugin APIの追加、`nightwatch.conf.cjs`のサポート、chai expectのアップデート。\nAssertion/Element C...",
            tags: ["E2E", "testing", "library", "ReleaseNote"],
            relatedLinks: [],
        },
    ]);
    assertEquals(name, "Nightwatch");
});
Deno.test("getProductName - {name} {ver}-rc.{ver}リリース", () => {
    const name = getProductName([
        {
            date: "2021-09-04T12:29:57.045Z",
            title: "jQuery UI 1.13.0-rc.2 released | jQuery UI Blog",
            url: "https://blog.jqueryui.com/2021/09/jquery-ui-1-13-0-rc-2-released/",
            content:
                "jQuery UI 1.13.0-rc.2リリース。\n5年ぶりとなるリリース。\n最近jQueryとの互換性を改善する目的のリリースであるため、非互換な変更は含まない。",
            tags: ["jQuery", "UI", "library", "ReleaseNote"],
            relatedLinks: [],
        },
    ]);
    assertEquals(name, "jQuery UI");
});

Deno.test("RELEASE_RULE data", async (t) => {
    for (const rule of RELEASE_RULE) {
        for (const test of rule.tests) {
            await t.step(test.input + " → " + test.output, async (t) => {
                const matchRule = rule.matchVersion?.(test.input);
                assert(matchRule, "should be matched: " + JSON.stringify(rule));
                const result = rule.version?.({ url: test.input, match: matchRule });
                assertEquals(result, test.output);
            });
        }
    }
});
