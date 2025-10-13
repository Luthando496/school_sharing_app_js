"use client";
import {
  Book,
  Upload,
  Search,
  Users,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"; // Using Lucide for icons

const ContentCard = ({ title, description, link, image, icon, category }) => (
  <a
    href={link}
    className="block rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02] card-bg"
  >
    {image && (
      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://placehold.co/600x400/${encodeURIComponent(
            "#4F46E5"
          )}/${encodeURIComponent("#6B7280")}?text=No+Image`;
        }}
      />
    )}
    <div className="p-6">
      {category && (
        <span className="text-xs text-accent font-semibold uppercase tracking-wider mb-2 block">
          {category}
        </span>
      )}
      <h3 className="text-xl primary-text font-semibold mb-2">{title}</h3>
      <p className="secondary-text text-sm mb-4">{description}</p>
      <span className="inline-flex text-accent items-center text-sm font-medium hover:text-accent-light">
        Learn More <ChevronRight size={16} className="ml-1" />
      </span>
    </div>
  </a>
);

export default ContentCard;
