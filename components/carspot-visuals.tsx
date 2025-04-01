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
          width={500}
          height={100}
          {...props}
        />
      ) : (
        <Image
          src="/unavailable-red.svg"
          alt="Unavailable Parking Spot"
          width={500}
          height={100}
          {...props}
        />
      )}
    </div>
  );
};

export default CarspotVisuals;
