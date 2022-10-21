# JSer.info Product Name API

Tiny Web API that provide product/library name for a URL.

This Web API using [JSer.info Dataset](https://github.com/jser/dataset).

## Response

- name: product name
- url: product url
- releaseNoteVersion: release note version if the target url is release note.
  - `string | undefined`
- releaseNoteProbability: Do this url have release notes?
    - 0 - 1

## Usage

Get Supported All products.

```
curl https://jser-product-name.deno.dev/
```

Get a product name for URL

```
curl https://jser-product-name.deno.dev/?url=${url}
```

## Example

```shell
$ curl https://jser-product-name.deno.dev/
[{"name":"jQuery Mobile","url":"http://jquerymobile.com"},{"name":"jQuery","url":"http://blog.jquery.com"},{"name":"Node","url":"http://blog.nodejs.org"},{"name":"Bootstrap","url":"http://blog.getbootstrap.com"}, ...]
```

```shell
$ curl "https://jser-product-name.deno.dev/?url=https://deno.com/blog/v1.19"
{"name":"Deno","url":"https://deno.com","releaseNoteProbability":0.7619047619047619,"releaseNoteVersion":"v1.19"}
```

No Data

```shell
$ curl "https://jser-product-name.deno.dev/?url=https://example.com
null # status code is 400
```

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
