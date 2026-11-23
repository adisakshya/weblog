---
title: "Hello, world: a sample draft"
date: 2026-11-23 09:00:00 +0530
tags: [sample, hello-world, markdown]
excerpt: "A dummy draft that exercises every kind of block a post can have, so the drafts preview can be reviewed end to end."
header:
  teaser: "https://picsum.photos/id/1015/1200/675"
---

This is a **dummy draft**. It exists so you can see how the drafts preview looks with a realistic mix of content. Delete it, or `git mv` it into `_posts/` to see what publishing does.

![A river winding through a green valley (random photo from picsum.photos)](https://picsum.photos/id/1015/1200/675)

## A quote

> The best way to predict the future is to invent it.
>
> — Alan Kay

## A code block

```python
def greet(name: str = "world") -> str:
    return f"Hello, {name}!"


print(greet())
```

And a shell one, with inline `code` too:

```bash
git mv _drafts/2026-11-23-hello-world.md _posts/2026-11-23-hello-world.md
```

## Lists and a table

1. Write the draft in `_drafts/`.
2. Open `/weblog/drafts/` and read it as readers will.
3. Publish it with `git mv`.

- Bullet one
- Bullet two with a [link to the blog](https://adisakshya.github.io/weblog/)

| Step | Where | Result |
| --- | --- | --- |
| Draft | `_drafts/` | Unlisted preview |
| Publish | `_posts/` | Live on the blog |

## Wrapping up

That is every block type in one place. Hello, world!
