import Image from "next/image";

interface CarspotVisualsProps {
  isAvailable: boolean;
  [key: string]: any;
}

const CarspotVisuals = ({ isAvailable, ...props }: CarspotVisualsProps) => {
  return (
    <div className="relative h-full w-full">
      {isAvailable ? (
        <div className="h-full w-full bg-transparent" {...props}></div>
      ) : (
        <Image
          src="/svg/car-parkingspot.svg"
          alt="Unavailable Parking Spot"
          layout="fill"
          objectFit="contain"
          {...props}
        />
      )}
    </div>
  );
};

export default CarspotVisuals;
