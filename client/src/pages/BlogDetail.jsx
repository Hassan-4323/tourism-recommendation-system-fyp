import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainNavbar from '../MainNavbar';
import { getBlogById, getBlogs } from '../api';
import '../App.css';

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setLoading(true);
        const [blogData, allBlogs] = await Promise.all([getBlogById(id), getBlogs()]);
        setBlog(blogData);
        const related = (Array.isArray(allBlogs) ? allBlogs : []).filter(
          (item) => item._id !== blogData._id && item.category === blogData.category
        );
        setRelatedBlogs(related.slice(0, 3));
      } catch (err) {
        setError(err.message || 'Unable to load this blog right now.');
      } finally {
        setLoading(false);
      }
    };

    loadBlogData();
  }, [id]);

  const paragraphs = useMemo(() => (blog?.content ? blog.content.split('\n\n') : []), [blog]);

  return (
    <div className="blog-detail-shell">
      <MainNavbar activeTab="home" searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="blog-detail-main dash-container">
        {loading && <p className="blog-loading-state">Loading article...</p>}
        {error && !loading && <p className="blog-error-state">{error}</p>}

        {!loading && blog && (
          <>
            <section className="blog-detail-hero">
              <div className="blog-detail-copy">
                <p className="dash-section-tag">Travel Blog</p>
                <h1>{blog.title}</h1>
                <p className="blog-detail-excerpt">{blog.excerpt}</p>
                <div className="blog-detail-meta">
                  <span>{blog.category}</span>
                  <span>{blog.readTime}</span>
                  <span>{blog.author}</span>
                </div>
                <div className="blog-detail-actions">
                  <button type="button" className="btn-outline" onClick={() => navigate('/blogs')}>
                    Back to Blogs
                  </button>
                  <button type="button" className="btn-primary" onClick={() => navigate('/dashboard#packages')}>
                    Explore Packages
                  </button>
                </div>
              </div>
              <div className="blog-detail-image-wrap">
                <img src={blog.imageUrl} alt={blog.title} className="blog-detail-image" />
              </div>
            </section>

            <section className="blog-detail-content-card">
              <div className="blog-article-content">
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <aside className="blog-side-card">
                <h3>Why read this</h3>
                <ul>
                  <li>Clear travel planning guidance</li>
                  <li>Useful before choosing a package</li>
                  <li>Short, practical and easy to apply</li>
                </ul>
                {blog.tags?.length > 0 && (
                  <div className="blog-tags-wrap">
                    {blog.tags.map((tag) => (
                      <span key={tag} className="blog-tag-pill">#{tag}</span>
                    ))}
                  </div>
                )}
              </aside>
            </section>

            {relatedBlogs.length > 0 && (
              <section className="blog-related-section">
                <div className="recommended-panel-head">
                  <div>
                    <h2>Related Blogs</h2>
                    <p>Continue reading more travel ideas from the same category.</p>
                  </div>
                </div>
                <div className="blogs-grid blogs-grid-list">
                  {relatedBlogs.map((item) => (
                    <article key={item._id} className="blog-list-card">
                      <img src={item.imageUrl} alt={item.title} className="blog-list-image" />
                      <div className="blog-list-body">
                        <div className="blog-list-meta">
                          <span>{item.category}</span>
                          <span>{item.readTime}</span>
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.excerpt}</p>
                        <button className="blog-inline-btn" type="button" onClick={() => navigate(`/blogs/${item.slug || item._id}`)}>
                          Read More
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default BlogDetail;
