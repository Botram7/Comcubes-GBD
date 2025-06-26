import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  items: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {item.label}
                </Link>
              ) : item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-gray-600">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
