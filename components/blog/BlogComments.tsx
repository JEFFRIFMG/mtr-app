interface BlogCommentsProps {
  postId: string;
  enabled: boolean;
}

/**
 * Placeholder for blog comments.
 * Schema-ready (commentsEnabled toggle exists on blogPost).
 * Full implementation (auth, moderation, threading) deferred — separate feature.
 */
export default function BlogComments({ postId, enabled }: BlogCommentsProps) {
  if (!enabled) return null;

  return (
    <section
      className="blog-comments"
      aria-label="Comments"
      data-post-id={postId}
    >
      <h3 className="blog-comments__title">Comments</h3>
      <p className="blog-comments__placeholder">No Comments</p>
    </section>
  );
}
