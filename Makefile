devf:
	yarn --cwd frontend run dev
devb:
	deno task --cwd backend dev
f:
	make devf
b:
	make devb