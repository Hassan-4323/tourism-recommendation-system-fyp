import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavbar from '../MainNavbar';
import { getBlogs } from '../api';
import '../App.css';

function BlogsList() {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const data = await getBlogs();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return blogs;
    return blogs.filter((blog) =>
      blog.title?.toLowerCase().includes(query) ||
      blog.category?.toLowerCase().includes(query) ||
      blog.excerpt?.toLowerCase().includes(query)
    );
  }, [blogs, searchTerm]);

  const featuredBlogs = useMemo(() => blogs.filter((blog) => blog.isFeatured).slice(0, 3), [blogs]);

  return (
    <div className="blogs-page-shell">
      <MainNavbar activeTab="home" searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="blogs-page-main dash-container">
        <section className="blogs-hero-card">
          <div>
            <p className="dash-section-tag">Travel Blogs</p>
            <h1 className="blogs-page-title">Travel inspiration, tips and destination stories</h1>
            <p className="blogs-page-text">
              Explore useful travel reading, quick destination ideas and planning tips that support smarter package selection.
            </p>
          </div>

          <button className="view-all-packages-btn" type="button" onClick={() => navigate('/dashboard#blogs')}>
            Back to Dashboard
          </button>
        </section>

        <section className="blogs-featured-panel">
          <div className="recommended-panel-head">
            <div>
              <h2>Featured Travel Reads</h2>
              <p>Highlighted blog posts for quick inspiration and helpful travel guidance.</p>
            </div>
          </div>

          <div className="blogs-grid blogs-grid-featured">
            {featuredBlogs.map((blog) => (
              <article key={blog._id} className="blog-card" onClick={() => navigate(`/blogs/${blog.slug || blog._id}`)}>
                <div className="blog-card-image-wrap">
                  <img src={blog.imageUrl} alt={blog.title} className="blog-card-image" />
                </div>
                <div className="blog-card-overlay" />
                <div className="blog-card-content">
                  <span className="blog-chip">{blog.category}</span>
                  <h3>{blog.title}</h3>
                  <p>{blog.excerpt}</p>
                  <span className="blog-read-link">Read Article</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="blogs-all-panel">
          <div className="recommended-panel-head">
            <div>
              <h2>All Blogs</h2>
              <p>{loading ? 'Loading blogs...' : `${filteredBlogs.length} blog posts available.`}</p>
            </div>
          </div>

          <div className="blogs-grid blogs-grid-list">
            {filteredBlogs.map((blog) => (
              <article key={blog._id} className="blog-list-card">
                <img src={blog.imageUrl} alt={blog.title} className="blog-list-image" />
                <div className="blog-list-body">
                  <div className="blog-list-meta">
                    <span>{blog.category}</span>
                    <span>{blog.readTime}</span>
                  </div>
                  <h3>{blog.title}</h3>
                  <p>{blog.excerpt}</p>
                  <button className="blog-inline-btn" type="button" onClick={() => navigate(`/blogs/${blog.slug || blog._id}`)}>
                    Read More
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default BlogsList;
