import { deepStrictEqual, strictEqual, rejects } from "node:assert";
import { test } from "node:test";
import worker from "./main.ts";
import type { JserItem } from "./lib.ts";

const items: JserItem[] = [
    {
        title: "Release v5.64.2 · webpack/webpack",
        url: "https://github.com/webpack/webpack/releases/tag/v5.64.2",
        content: "webpack 5.64.2リリース。",
        date: "2021-11-04T00:00:00.000Z",
        tags: ["ReleaseNote"],
    },
    {
        title: "webpack documentation",
        url: "https://github.com/webpack/webpack/wiki",
        content: "webpackのドキュメント。",
        date: "2021-11-05T00:00:00.000Z",
        tags: [],
    },
];

const product = {
    name: "webpack",
    url: "https://github.com/webpack/webpack",
    releaseNoteProbability: 0.5,
};

test("Worker returns the product list from the JSer.info dataset", async (t) => {
    const fetchMock = t.mock.method(globalThis, "fetch", async (url: string) => {
        strictEqual(url, "https://jser.info/source-data/items.json");
        return Response.json(items);
    });
    const response = await worker.fetch(new Request("http://localhost/"));
    strictEqual(response.status, 200);
    strictEqual(response.headers.get("content-type"), "application/json");
    deepStrictEqual(await response.json(), [product]);
    strictEqual(fetchMock.mock.callCount(), 1);
});

test("Worker returns the product and release version for a release URL", async (t) => {
    t.mock.method(globalThis, "fetch", async () => Response.json(items));
    const url = new URL("http://localhost/");
    url.searchParams.set("url", "https://github.com/webpack/webpack/releases/tag/v5.64.2");
    const response = await worker.fetch(new Request(url));
    strictEqual(response.status, 200);
    deepStrictEqual(await response.json(), { ...product, releaseNoteVersion: "v5.64.2" });
});

test("Worker omits the version for a product URL", async (t) => {
    t.mock.method(globalThis, "fetch", async () => Response.json(items));
    const url = new URL("http://localhost/");
    url.searchParams.set("url", product.url);
    const response = await worker.fetch(new Request(url));
    strictEqual(response.status, 200);
    deepStrictEqual(await response.json(), product);
});

test("Worker returns null with 404 for an unknown product", async (t) => {
    t.mock.method(globalThis, "fetch", async () => Response.json(items));
    const response = await worker.fetch(new Request("http://localhost/?url=https://example.com"));
    strictEqual(response.status, 404);
    strictEqual(await response.text(), "null");
});

test("Worker propagates a dataset failure and retries on the next request", async (t) => {
    const fetchMock = t.mock.method(globalThis, "fetch", async () =>
        new Response("Unavailable", { status: 503, statusText: "Service Unavailable" }));
    await rejects(worker.fetch(new Request("http://localhost/")), /items.json: Service Unavailable/);
    fetchMock.mock.mockImplementation(async () => Response.json(items));
    const response = await worker.fetch(new Request("http://localhost/"));
    strictEqual(response.status, 200);
    deepStrictEqual(await response.json(), [product]);
});
