import { ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";

interface PageHeadingProps {
  pageName?: string;
  title?: string;
  description?: string;
}

const PageHeading = ({ pageName, title, description }: PageHeadingProps) => {
  const location = useLocation();
  const pathname = location.pathname;
  const pathSegments = pathname.split("/").filter((seg) => seg !== "");

  // Use title if provided, otherwise use pageName, or fallback to the last path segment
  const displayTitle = title || pageName || (pathSegments.length > 0 
    ? pathSegments[pathSegments.length - 1]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "");

  return (
    <div className="flex gap-2 justify-between items-center mb-8 flex-col md:flex-row">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-x-1 text-sm text-gray-400 mb-0.5">
          <a href="/" className="text-gray-500 text-sm font-medium">
            Home
          </a>
          {pathSegments.map((segment, index) => (
            <span key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <a
                href={`/${pathSegments.slice(0, index + 1).join("/")}`}
                className="text-gray-500 text-sm font-medium"
              >
                {segment
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </a>
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold">{displayTitle}</h1>
        {description && <p className="text-gray-600 mt-2">{description}</p>}
      </div>
    </div>
  );
};

export default PageHeading;
