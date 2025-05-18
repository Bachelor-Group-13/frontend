import Image from "next/image";

/**
 * Props for the CarspotVisuals component.
 * @param isAvailable - Whether the parking spot is available
 * @param {unknown} [key] – Additional props that can be passed to the component */
interface CarspotVisualsProps {
  isAvailable: boolean;
  [key: string]: unknown;
}

/**
 * A component that displays a visual representation of a parking spot.
 *
 * Shows either an empty spot or a car icon based on availability.
 * @param isAvailable
 * @param props
 */
const CarspotVisuals = ({ isAvailable, ...props }: CarspotVisualsProps) => {
  return (
    <div className="relative h-full w-full">
      {/* Show empty spot or car icon based on availability */}
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
