import { useState, useEffect, useCallback, useRef } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { TypographyP } from "../../@/components/ui/typography";

interface ImageEditorProps {
  image: string;
  onChange?: (image: string) => void;
}

const ImageEditor = ({ image, onChange }: ImageEditorProps) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getCroppedImg = useCallback(
    async (
      image: HTMLImageElement,
      crop: Crop,
      rotation: number
    ): Promise<string> => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No 2d context");
      }

      const cropWidth =
        crop.unit === "%" ? (crop.width * image.width) / 100 : crop.width;
      const cropHeight =
        crop.unit === "%" ? (crop.height * image.height) / 100 : crop.height;

      // Account for potential rotation dimensions
      const rotatedWidth = rotation % 180 === 0 ? cropWidth : cropHeight;
      const rotatedHeight = rotation % 180 === 0 ? cropHeight : cropWidth;

      // Calculate canvas size based on rotation
      canvas.width = rotatedWidth;
      canvas.height = rotatedHeight;

      // Translate canvas and rotate around center
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cropWidth / 2, -cropHeight / 2);

      // Clear the canvas before drawing the new image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(blob);
          }
        }, "image/png");
      });
    },
    []
  );

  const handleCropChange = (newCrop: Crop) => {
    setCrop(newCrop);
  };

  const handleRotateLeft = () => {
    setRotation((prevRotation) => (prevRotation - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  useEffect(() => {
    if (imgRef.current && onChange) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (imgRef.current) {
          getCroppedImg(imgRef.current, crop, rotation).then((newImage) => {
            onChange(newImage);
          });
        }
      }, 100);
    }
  }, [crop, rotation, onChange, getCroppedImg]);

  return (
    <div>
      <ReactCrop
        crop={crop}
        onChange={handleCropChange}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={image} ref={imgRef} />
      </ReactCrop>
      <div>
        <TypographyP>Rotate:</TypographyP>
        <Button onClick={handleRotateLeft}>Rotate Left</Button>
        <Button onClick={handleRotateRight}>Rotate Right</Button>
      </div>
    </div>
  );
};

export default ImageEditor;
