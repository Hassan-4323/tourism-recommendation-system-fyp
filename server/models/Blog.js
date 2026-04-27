const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    category: { type: String, default: 'Travel Guide', trim: true },
    author: { type: String, default: 'Touringo Team', trim: true },
    readTime: { type: String, default: '5 min read', trim: true },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
