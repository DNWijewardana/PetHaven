import { ArrowRight } from "lucide-react";
import { NavLink } from "react-router";
import dog from "../assets/images/dog-walking.png";

type FeaturedCardProps = {
  title: string;
  description: string;
  link?: string;
};

const FeaturedCard = (props: FeaturedCardProps) => {
  const { title, description, link = "#" } = props;
  return (
    <div
      className={`flex flex-row p-4 max-w-2xl mx-auto flex-nowrap gap-4 border items-center hover:border-rose-500/80 shadow  transition-colors rounded-2xl overflow-hidden`}
    >
      <img src={dog} alt="Card Image" className="w-2/6 object-cover" />
      <div className="flex flex-col w-4/6">
        <h2 className={`text-xl text-rose-500`}>{title}</h2>
        <p className="text-gray-600 line-clamp-3 sm:line-clamp-4 md:line-clamp-5">
          {description}
        </p>
        <NavLink
          to={link}
          className="text-lg flex flex-row hover:bg-rose-500 max-w-fit bg-rose-50 py-1 px-4 rounded hover:text-white transition-colors items-center gap-2 mt-1"
        >
          Learn More <ArrowRight className="text-lg" />
        </NavLink>
      </div>
    </div>
  );
};

export default FeaturedCard;
