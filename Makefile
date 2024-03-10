run:
	deno run --watch --allow-net main.ts

test:
    deno test --allow-net

.PHONY: run test
