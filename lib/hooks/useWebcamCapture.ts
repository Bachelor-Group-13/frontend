import { useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { api } from "@/lib/api/auth";

/**
 * A hook that manages webcam capture and license plate detection.
 *
 * @param {Function} onDetected - Callback function called when license plates are detected
 * @returns {Object} An object containing:
 *   - webcamRef: Reference to the webcam component
 *   - capture: Function to capture and process an image
 */
export function useWebcamCapture(onDetected: (plates: string[]) => void) {
  const webcamRef = useRef<Webcam>(null);

  // Captures an image from the webcam and sends it for license plate detection
  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const blob = await (await fetch(imageSrc)).blob();
        const file = new File([blob], "capture.jpg", {
          type: "image/jpeg",
        });
        await sendToRecognition(file);
      }
    }
  }, []);

  // Sends the captured image to the license plate recognition API
  const sendToRecognition = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/license-plate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.license_plates) {
        onDetected(res.data.license_plates);
      }
    } catch (err) {
      console.error("License plate detection failed", err);
    }
  };

  return {
    webcamRef,
    capture,
  };
}
