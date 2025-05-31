import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { ChevronsDown } from "lucide-react";

import Autoplay from "embla-carousel-autoplay";
import React from "react";
import { Button } from "./ui/button";

const HeroContent = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, active: true })
  );

  const carouselItems = [
    "https://img.freepik.com/free-photo/elegant-woman-brown-coat-with-black-bulldog_1157-31789.jpg",
    "https://img.freepik.com/free-photo/beautiful-cat-home_23-2149304101.jpg",
    "https://img.freepik.com/free-photo/medium-shot-women-playing-with-dog_23-2148977438.jpg",
    "https://img.freepik.com/free-photo/happy-woman-smiling-while-posing-with-her-dog_23-2148566972.jpg",
    "https://img.freepik.com/free-photo/girl-her-cat-vet_329181-10401.jpg",
  ];

  return (
    <div className="relative flex justify-center items-center h-screen">
      <div className="absolute w-full z-20 px-4">
        <h1 className="z-10 text-white font-bold w-full text-4xl md:text-5xl lg:text-6xl text-center">
          A Place for Kind Hearts and Happy Tails
        </h1>
        <p className="text-white text-center mt-8 text-lg md:text-xl lg:text-2xl z-10 max-w-4xl mx-auto">
          Find, reunite, and adopt pets with ease. Whether you've lost a furry
          friend, found a stray, or are looking to adopt, our platform connects
          pet lovers for a happier, safer community. 🐾💕
        </p>
        <Button
          className="hover:no-underline hover:cursor-pointer hover:text-gray-200 hover:animate-none animate-bounce flex items-center gap-2 z-10 mt-8 text-xl mx-auto text-white"
          variant="link"
        >
          <ChevronsDown className="text-xl" />
          Explore
          <ChevronsDown className="text-xl" />
        </Button>
      </div>
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>
      <Carousel
        plugins={[plugin.current]}
        className="w-full h-screen pointer-events-none"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {carouselItems.map((item, index) => (
            <CarouselItem
              key={index}
              className="h-screen flex items-center justify-center"
            >
              <img
                src={item}
                alt="carousel image"
                className="object-cover object-top w-full h-full"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default HeroContent;
