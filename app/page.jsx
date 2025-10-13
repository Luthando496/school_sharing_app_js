import Link from "next/link";
import ContentCard from "./Content";
import { Book, Upload, Search, Users, Menu, X, ChevronRight } from 'lucide-react'; // Using Lucide for icons

// Helper component for buttons
const Button = ({ children, primary = true, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-3 rounded-md text-sm font-semibold transition-all duration-300 ease-in-out
      ${primary ? 'bg-btn hover:bg-btn' : 'bg-btn-secondary hover:bg-btn-secondary'}
      ${className}
    `}
  >
    {children}
  </button>
);

// Main Content Sections
const MainContent = () => {
  const featuredResources = [
    {
      id: 1,
      title: 'Mastering Calculus: Study Guide',
      description: 'Comprehensive notes and practice problems for advanced calculus.',
      link: '/resources/calculus-guide',
      image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      category: 'Mathematics'
    },
    {
      id: 2,
      title: 'Python for Beginners: Project Files',
      description: 'Downloadable project files and code examples for your first Python projects.',
      link: '/resources/python-beginners',
      image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      category: 'Computer Science'
    },
    {
      id: 3,
      title: 'World History Timeline: Interactive Map',
      description: 'An interactive map detailing key events and figures in world history.',
      link: '/resources/history-timeline',
      image: 'https://images.pexels.com/photos/167682/pexels-photo-167682.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      category: 'History'
    },
  ];

  const latestUpdates = [
    {
      id: 4,
      title: 'New Feature: Enhanced Search Filters',
      description: 'Find resources even faster with our improved search and filtering options.',
      link: '/blog/enhanced-search',
      category: 'Platform Update'
    },
    {
      id: 5,
      title: 'Top 10 Study Tips for Midterms',
      description: 'Expert advice to help you ace your upcoming midterm exams.',
      link: '/blog/study-tips',
      category: 'Study Guide'
    },
  ];

  return (
    <div className="py-12 md:py-20 bg-primary">
      <div className="container mx-auto px-4">
        {/* Featured Resources Section */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 primary-text">
          Featured Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {featuredResources.map(resource => (
            <ContentCard key={resource.id} {...resource} />
          ))}
        </div>

        {/* Latest Updates Section */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 primary-text">
          Latest Updates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {latestUpdates.map(update => (
            <ContentCard key={update.id} {...update} />
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="text-center py-16 px-6 rounded-lg bg-secondary shadow-lg">
          <h3 className="text-3xl font-bold mb-4 primary-text">
            Can't Find What You're Looking For?
          </h3>
          <p className="text-lg mb-8 secondary-text">
            Or perhaps you have something great to share with the community!
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button>
              <Search className="inline-block mr-2" size={18} />
              Explore All Resources
            </Button>
            <Button primary={false}>
              <Upload className="inline-block mr-2" size={18} />
              Share Your Knowledge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <>
      <section className="header_img bg-cover bg-center min-h-[70vh] flex items-center">
        <div className="px-4 mx-auto max-w-7xl text-center py-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold primary-text mb-6">Welcome to Resource Sharing Hub</h1>
          <p className="text-lg md:text-xl lg:text-2xl secondary-text mb-8">Discover, Share, and Collaborate on Valuable Resources</p>
          <div className="flex justify-center gap-4">
            <button className="bg-btn font-semibold py-3 px-6 rounded-lg text-lg md:text-xl lg:text-2xl duration-300 cursor-pointer">Get Started</button>
            <button className="bg-btn-secondary font-semibold py-3 px-6 rounded-lg text-lg md:text-xl lg:text-2xl duration-300 cursor-pointer">Learn More</button>
          </div>
        </div>
      </section>

      <section className="grids_section w-full mx-auto px-4 my-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 items-start">
          <article className="w-full card-bg col-span-1 text-center p-6 border border-primary rounded-lg shadow-lg">
            <h2 className="text-3xl font-extrabold primary-text">20+</h2>
            <p className="mt-2 secondary-text font-normal">Documents uploaded by students.</p>
          </article>
          <article className="w-full card-bg col-span-1 text-center p-6 border border-primary rounded-lg shadow-lg">
            <h2 className="text-3xl font-extrabold primary-text">300+</h2>
            <p className="mt-2 secondary-text font-normal">Students using the website.</p>
          </article>
          <article className="w-full card-bg col-span-1 text-center p-6 border border-primary rounded-lg shadow-lg">
            <h2 className="text-3xl font-extrabold primary-text">4+</h2>
            <p className="mt-2 secondary-text font-normal">Partnered with companies.</p>
          </article>
          <article className="w-full card-bg col-span-1 text-center p-6 border border-primary rounded-lg shadow-lg">
            <h2 className="text-3xl font-extrabold primary-text">12x</h2>
            <p className="mt-2 secondary-text font-normal">Of knowledge gained by students.</p>
          </article>
        </div>
      </section>

      <section className="study bg-secondary mb-10">
        <div className="px-4 mx-auto max-w-7xl text-center py-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold primary-text mb-6">Enhance Your Learning Experience</h2>
          <p className="text-lg md:text-xl lg:text-2xl secondary-text mb-8">Join a community of learners and access a wealth of resources to support your academic journey.</p>
          <div className="flex justify-center gap-4">
            <button className="bg-btn-secondary font-semibold py-3 px-6 rounded-lg text-lg md:text-xl lg:text-2xl duration-300 cursor-pointer">Join Now</button>
            <button className="bg-btn-secondary font-semibold py-3 px-6 rounded-lg text-lg md:text-xl lg:text-2xl duration-300 cursor-pointer">Explore Resources</button>
          </div>
        </div>
      </section>
      <MainContent />
    </>
  );
}