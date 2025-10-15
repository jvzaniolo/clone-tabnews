import Image from 'next/image';
import image1 from 'images/image-1.jpeg';
import image2 from 'images/image-2.jpeg';
import image3 from 'images/image-3.jpeg';
import image4 from 'images/image-4.jpeg';
import image5 from 'images/image-5.jpeg';
import image6 from 'images/image-6.jpeg';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const images = [
  {
    src: image1,
    alt: '',
    subtitle: 'Primeiro encontro com a Rafaella 🌻',
  },
  {
    src: image2,
    alt: '',
    subtitle: 'A foto favorita dela 💖',
  },
  {
    src: image3,
    alt: '',
    subtitle: 'Eu nervoso para entregar o buquê 💐',
  },

  {
    src: image4,
    alt: '',
    subtitle: 'Pedi ela em namoro 💑 (ela disse sim)',
  },
  {
    src: image5,
    alt: '',
    subtitle: 'Minha parceirinha nerd de Harry Potter 🧙‍♀️',
  },
  {
    src: image6,
    alt: '',
    subtitle: 'Coisa mais linda da minha vida 🥰',
  },
];

export default function Home() {
  return (
    <div className="flex overflow-auto w-full h-dvh snap-x snap-mandatory scroll-smooth">
      <div className="absolute top-0 inset-x-0 left-0 bg-gradient-to-b from-black/50 to-transparent z-10 p-4 flex">
        <Link href="/" className="text-white rounded-full bg-black/25 p-2 flex">
          <ArrowLeft />
        </Link>
      </div>
      {images.map((image, index) => (
        <div key={index} className="relative w-full h-full snap-start object-center shrink-0">
          <Image
            src={image.src}
            alt={image.alt}
            className="blur-3xl absolute top-0 left-0 w-full h-full -z-10"
          />
          <Image src={image.src} alt={image.alt} className="h-full object-contain w-full" />
          <div className="absolute bottom-0 top-1/2 inset-x-0 p-4 bg-gradient-to-b from-transparent to-black z-10" />
          <div className="absolute bottom-0 inset-x-0 z-10">
            <h1 className="text-white text-xl p-4">{image.subtitle}</h1>
          </div>
        </div>
      ))}
    </div>
  );
}
