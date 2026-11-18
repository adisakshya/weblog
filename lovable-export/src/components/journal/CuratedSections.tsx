import { Play } from "lucide-react";
import { books, videos, curatedImage, personalThoughts } from "@/content/curated";

function Thoughts({ item }: { item: { thoughts?: string | null } }) {
  const thoughts = personalThoughts(item);
  return thoughts ? <p className="mt-2 text-sm j-muted">{thoughts}</p> : null;
}

export function CuratedSections() {
  return (
    <>
      <section aria-labelledby="bookshelf-h" className="j-curated-section">
        <h2 id="bookshelf-h" className="text-2xl font-bold">Bookshelf</h2>
        <ul className="j-bookshelf mt-5">
          {books.map((book) => (
            <li key={book.id} className="min-w-0">
              <a href={book.url} target="_blank" rel="noopener noreferrer" className="plain group block">
                <div className="j-book-cover"><img src={curatedImage(book.cover)} alt={`Cover of ${book.title}`} loading="lazy" /></div>
                <h3 className="mt-3 text-sm font-semibold leading-snug group-hover:underline">{book.title}</h3>
                <p className="mt-1 text-sm j-muted">{book.author}</p>
              </a>
              <Thoughts item={book} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="watching-h" className="j-curated-section">
        <h2 id="watching-h" className="text-2xl font-bold">Worth watching</h2>
        <ul className="mt-5 grid gap-5 md:grid-cols-3">
          {videos.map((video) => (
            <li key={video.id} className="min-w-0">
              <a href={video.url} target="_blank" rel="noopener noreferrer" className="plain group block">
                <div className="j-video-thumbnail">
                  <img src={curatedImage(video.thumbnail)} alt={`Thumbnail for ${video.title}`} loading="lazy" />
                  <span className="j-video-play" aria-hidden="true"><Play size={18} fill="currentColor" /></span>
                </div>
                <h3 className="mt-3 font-semibold leading-snug group-hover:underline">{video.title}</h3>
                <p className="mt-1 text-sm j-muted">{video.creator}</p>
              </a>
              <Thoughts item={video} />
            </li>
          ))}
        </ul>
      </section>

    </>
  );
}