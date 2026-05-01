import html.parser

class HTMLValidator(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        if tag not in ['img', 'br', 'hr', 'input', 'link', 'meta', 'base', 'area', 'col', 'embed', 'keygen', 'source', 'track', 'wbr']:
            self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag in ['img', 'br', 'hr', 'input', 'link', 'meta', 'base', 'area', 'col', 'embed', 'keygen', 'source', 'track', 'wbr']:
            return
        if not self.stack:
            self.errors.append(f"Unexpected end tag </{tag}> at line {self.getpos()[0]}")
            return
        last_tag, pos = self.stack.pop()
        if last_tag != tag:
            self.errors.append(f"Mismatched tag: expected </{last_tag}> (from line {pos[0]}), found </{tag}> at line {self.getpos()[0]}")

    def close(self):
        super().close()
        for tag, pos in self.stack:
            self.errors.append(f"Unclosed tag <{tag}> from line {pos[0]}")

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

validator = HTMLValidator()
validator.feed(content)
validator.close()

if validator.errors:
    print("\n".join(validator.errors))
else:
    print("No HTML errors found.")
