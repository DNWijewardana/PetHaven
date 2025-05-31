const AboutCard = ({
  name,
  role,
  image,
}: {
  name: string;
  role: string;
  image: string;
}) => {
  return (
    <div className="group w-full max-w-60 transition-all duration-300 hover:scale-105">
      <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="overflow-hidden rounded-full w-32 h-32 border-2 border-rose-400">
          <img
            className="aspect-square w-full h-full object-cover"
            src={image}
            alt={`${name}'s profile picture`}
          />
        </div>
        <div className="flex flex-col items-center text-center space-y-1">
          <h2 className="text-lg font-bold">{name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutCard;
