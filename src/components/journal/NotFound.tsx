import { Link } from "@tanstack/react-router";
import { AdiMark } from "@/components/brand/AdiMark";

/** The branded not-found page, inside the normal site shell (header and footer). One component for an unknown URL and for an
 *  unknown article URL. */
export function NotFoundPage() {
  return (
    <section className="j-notfound">
      <p className="j-notfound-label">404 · Page not found</p>
      <AdiMark className="j-notfound-mark" />
      <h1 className="j-notfound-title">Back to the beginning.</h1>
      <p className="j-notfound-text">
        This page doesn't exist — but every path on this blog starts from the same point.
      </p>
      <Link to="/" className="j-btn j-notfound-button">
        Go to the blog
      </Link>
    </section>
  );
}
