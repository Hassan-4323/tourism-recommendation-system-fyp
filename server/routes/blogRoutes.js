const express = require('express');
const Blog = require('../models/Blog');

const router = express.Router();

const defaultBlogs = [
  {
    title: 'Guidelines For International Travel',
    slug: 'guidelines-for-international-travel',
    excerpt: 'Simple planning tips for documents, packing, timing and safe travel decisions before any international journey.',
    content: `Planning an international trip becomes much easier when the basics are organised early. Start by checking passport validity, visa requirements and destination-specific travel advisories. Keep digital and printed copies of key documents, including identification, hotel confirmations and return tickets.\n\nCreate a packing list based on weather, transport comfort and local customs. A light travel pouch for documents, cards, medication and essentials helps reduce stress during airport movement.\n\nBefore departure, review local transport options, emergency contact numbers and your travel budget. Small checks before leaving often make the whole trip smoother, safer and more enjoyable.`,
    imageUrl: 'https://images.pexels.com/photos/3769138/pexels-photo-3769138.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Travel Guide',
    author: 'Touringo Editorial',
    readTime: '4 min read',
    isFeatured: true,
    tags: ['international', 'planning', 'documents'],
  },
  {
    title: 'Family Vacation Destination Tips',
    slug: 'family-vacation-destination-tips',
    excerpt: 'How to choose a destination that works for children, parents and shared group comfort without overcomplicating the trip.',
    content: `A good family destination should balance comfort, travel time and activities for different ages. Places with moderate weather, flexible hotel options and short daily travel routes are often easier for families.\n\nWhen comparing packages, check how many stops are included, whether meals or transport support are available, and if the destination has open spaces where children can enjoy the trip comfortably.\n\nChoose packages with realistic schedules instead of overloaded itineraries. A calm, well-paced family trip often creates better memories than a rushed plan with too many destinations.`,
    imageUrl: 'https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Family Travel',
    author: 'Touringo Editorial',
    readTime: '5 min read',
    isFeatured: true,
    tags: ['family', 'destinations', 'comfort'],
  },
  {
    title: 'Budget Friendly Group Tour Planning',
    slug: 'budget-friendly-group-tour-planning',
    excerpt: 'Smart ways to reduce cost on group tours while keeping transport, stay and timing comfortable for everyone.',
    content: `Group travel works best when responsibilities and expectations are clear from the start. Agree on budget range, trip duration and activity level before finalising a package.\n\nChoosing shared transport, off-peak dates and destinations with bundled services can lower the cost significantly. It also helps to appoint one person to keep everyone updated about schedules and payments.\n\nBudget planning does not mean sacrificing experience. It means choosing the right destination, the right timing and a package with practical inclusions.`,
    imageUrl: 'https://images.pexels.com/photos/618613/pexels-photo-618613.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Budget Travel',
    author: 'Touringo Editorial',
    readTime: '4 min read',
    isFeatured: true,
    tags: ['budget', 'group', 'packages'],
  },
  {
    title: 'Destinations For Your Next Excursion',
    slug: 'destinations-for-your-next-excursion',
    excerpt: 'A quick destination idea list for short excursions, local sightseeing and relaxed family-friendly outings.',
    content: `Short excursions are ideal when you want a refreshing experience without long planning cycles. The best places for quick trips are those with easy access, clear sightseeing value and manageable day schedules.\n\nLook for destinations that offer scenic views, memorable local culture or one standout activity. These trips are perfect for weekends, family outings and light travel plans that do not require extensive preparation.\n\nWhen choosing a package, focus on route convenience, return timing and basic comfort so the excursion remains easy and enjoyable.`,
    imageUrl: 'https://images.pexels.com/photos/2409681/pexels-photo-2409681.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Destination Ideas',
    author: 'Touringo Editorial',
    readTime: '3 min read',
    isFeatured: true,
    tags: ['excursion', 'family', 'weekend'],
  },
];

async function ensureBlogsSeeded() {
  const count = await Blog.countDocuments();
  if (count > 0) return;
  await Blog.insertMany(defaultBlogs);
}

router.get('/', async (req, res) => {
  try {
    await ensureBlogsSeeded();
    const blogs = await Blog.find({ isPublished: true }).sort({ isFeatured: -1, createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load blogs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await ensureBlogsSeeded();
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    const blog = await Blog.findOne({ ...query, isPublished: true });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load blog' });
  }
});

module.exports = router;
