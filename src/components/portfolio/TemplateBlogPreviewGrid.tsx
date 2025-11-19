import ComponentErrorBoundary from "./ComponentErrorBoundary";

interface BlogPost {
  id?: number;
  title?: string;
  excerpt?: string;
  featured_image?: string;
  published_date?: string;
}

interface BlogPreviewGridProps {
  posts: BlogPost[];
  postsPerRow?: number;
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateBlogPreviewGrid({
  posts = [],
  postsPerRow = 3,
  templateType,
  config,
}: BlogPreviewGridProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <ComponentErrorBoundary componentName="Blog Preview Grid">
      <section id="section-blog_preview_grid" className={`blog-preview-grid blog-preview-grid-${templateType}`}>
        <div className="blog-preview-grid-container">
          <h2 className="blog-preview-grid-title">Latest Posts</h2>
          <div
            className="blog-preview-grid-list"
            style={{ gridTemplateColumns: `repeat(${postsPerRow}, 1fr)` }}
          >
            {posts.map((post, idx) => (
              <article key={post.id || idx} className="blog-preview-grid-item">
                {post.featured_image && (
                  <div className="blog-preview-grid-image-wrapper">
                    <img
                      src={post.featured_image}
                      alt={post.title || "Blog post"}
                      className="blog-preview-grid-image"
                    />
                  </div>
                )}
                <div className="blog-preview-grid-content">
                  {post.published_date && (
                    <time className="blog-preview-grid-date">
                      {new Date(post.published_date).toLocaleDateString()}
                    </time>
                  )}
                  {post.title && (
                    <h3 className="blog-preview-grid-item-title">
                      {post.title}
                    </h3>
                  )}
                  {post.excerpt && (
                    <p className="blog-preview-grid-item-excerpt">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}

