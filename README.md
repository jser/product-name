# JSer.info Product Name API

Tiny API that provide product/library name for a URL.

## Usage

Supported All products.

```
curl https://jser-product-name.deno.dev/
```

Return a product name for URL

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
{"name":"Deno","url":"https://deno.com"}
```

## Tests

- [ ] Write How to Tests

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
