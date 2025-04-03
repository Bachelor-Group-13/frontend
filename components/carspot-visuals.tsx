import Image from "next/image";

interface CarspotVisualsProps {
  isAvailable: boolean;
  [key: string]: any;
}

const CarspotVisuals = ({ isAvailable, ...props }: CarspotVisualsProps) => {
  return (
    <div>
      {isAvailable ? (
        <Image
          src="/available-green.svg"
          alt="Available Parking Spot"
          layout="fill"
          objectFit="contain"
          {...props}
        />
      ) : (
        <Image
          src="/unavailable-red.svg"
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
