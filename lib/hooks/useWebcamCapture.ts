import { useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { api } from "@/lib/api/auth";

/**
 * A hook that manages webcam capture and license plate detection.
 *
 * @param onDetected - Callback function called when license plates are detected
 */
export function useWebcamCapture(onDetected: (plates: string[]) => void) {
  const webcamRef = useRef<Webcam>(null);

  const sendToRecognition = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await api.post("/license-plate", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.license_plates) {
          onDetected(res.data.license_plates);
        }
      } catch (err) {
        console.error("License plate detection failed", err);
      }
    },
    [onDetected]
  );

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const blob = await (await fetch(imageSrc)).blob();
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

    await sendToRecognition(file);
  }, [sendToRecognition]);

  return { webcamRef, capture };
}
