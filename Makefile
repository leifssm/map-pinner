devf:
	yarn --cwd frontend run dev
devb:
	deno task --cwd backend dev
f:
	make devf
b:
	make devb
display:
	deno task --cwd backend display
create-hooks:
	deno task --cwd backend create-hooks