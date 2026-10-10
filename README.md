# JSer.info Product Name API

Tiny Web API that provide product/library name for a URL.

This Web API uses [JSer.info Dataset](https://github.com/jser/dataset) and runs on Cloudflare Workers.

## Response

- name: product name
- url: product url
- releaseNoteVersion: release note version if the target url is release note.
  - `string | undefined`
- releaseNoteProbability: Do this url have release notes?
    - 0 - 1

## Usage

The examples below use the local development server. After deploying, replace
`http://localhost:8000` with the URL printed by Wrangler.

Get Supported All products.

```
curl http://localhost:8000/
```

Get a product name for URL

```
curl "http://localhost:8000/?url=${url}"
```

## Example

```shell
$ curl http://localhost:8000/
[{"name":"jQuery Mobile","url":"http://jquerymobile.com"},{"name":"jQuery","url":"http://blog.jquery.com"},{"name":"Node","url":"http://blog.nodejs.org"},{"name":"Bootstrap","url":"http://blog.getbootstrap.com"}, ...]
```

```shell
$ curl "http://localhost:8000/?url=https://deno.com/blog/v1.19"
{"name":"Deno","url":"https://deno.com","releaseNoteProbability":0.7619047619047619,"releaseNoteVersion":"v1.19"}
```

No Data

```shell
$ curl "http://localhost:8000/?url=https://example.com"
null # status code is 404
```

## Develop

Requires Node.js 22 or newer and pnpm 10.15.0.

```sh
pnpm install
pnpm dev
```

`make run` also starts the local server on port 8000. Each request fetches the
current JSer.info dataset; no database or storage binding is required.

## Test

```sh
pnpm test
pnpm typecheck
pnpm build
```

`make test` also runs the tests. `pnpm build` bundles the Worker without deploying it.

## Deploy

```sh
pnpm exec wrangler login
pnpm deploy
```

Wrangler deploys the `jser-product-name` Worker to the selected Cloudflare account
and prints its public URL. Update API clients to use that URL; the previous
`deno.dev` address cannot be served by Cloudflare Workers.

For [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/),
connect this repository, set the build command to
`pnpm typecheck && pnpm test && pnpm build`, and the deploy command to `pnpm deploy`.
GitHub Actions runs checks only.

## Related

- [jser/dataset: JSer.infoのデータセットや処理ライブラリ](https://github.com/jser/dataset)

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
