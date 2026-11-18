import { Link } from "@tanstack/react-router";
import { formatDate, type Post } from "@/content/content";

export function PostMeta({
  post,
  tags = true,
  allTags = false,
}: {
  post: Post;
  tags?: boolean;
  allTags?: boolean;
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm j-muted">
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span>{post.readingTime} min read</span>
      {tags &&
        (allTags ? post.tags : post.tags.slice(0, 3)).map((t) => (
          <Link key={t} to="/tags/$tag" params={{ tag: t }} className="j-chip">
            #{t}
          </Link>
        ))}
    </p>
  );
}
