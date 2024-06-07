import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ReactCrop, { Crop, PercentCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "../../@/components/ui/button";
import { Icons } from "../../@/components/ui/Icon";

interface ImageEditorProps {
  image: string;
  onChange?: (image: string, rotatedImage: string) => void;
}

const ImageEditor = ({ image, onChange }: ImageEditorProps) => {
  const cropFull = useMemo(
    () => ({
      unit: "%" as const,
      width: 100,
      height: 100,
      x: 0,
      y: 0,
    }),
    []
  );
  const [percentCrop, setPercentCrop] = useState<PercentCrop>(cropFull);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [rotatedImage, setRotatedImage] = useState(image);
  const [firstRender, setFirstRender] = useState(true);
  const [imageEditorKey, setImageEditorKey] = useState(0);
  const [lastRotateDirection, setLastRotateDirection] = useState<
    "left" | "right" | null
  >(null);

  const getCroppedImg = useCallback(
    async (
      image: HTMLImageElement,
      crop: PercentCrop,
      rotation: number
    ): Promise<string> => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("No 2d context");
      }

      // Adjust crop for rotation
      for (let i = 0; i < Math.abs(rotation / 90); i++) {
        crop = rotateCrop(crop, "left");
      }

      const cropWidth = (crop.width * image.width) / 100;
      const cropHeight = (crop.height * image.height) / 100;

      // Account for potential rotation dimensions
      const rotatedWidth = rotation % 180 === 0 ? cropWidth : cropHeight;
      const rotatedHeight = rotation % 180 === 0 ? cropHeight : cropWidth;

      // Calculate canvas size based on rotation
      canvas.width = rotatedWidth;
      canvas.height = rotatedHeight;

      // Translate canvas and rotate around center
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw the image in the center of the canvas, then adjust for cropping
      ctx.drawImage(
        image,
        (crop.x * image.width) / 100,
        (crop.y * image.height) / 100,
        cropWidth,
        cropHeight,
        -cropWidth / 2,
        -cropHeight / 2,
        cropWidth,
        cropHeight
      );

      ctx.restore();

      // Convert the canvas to a data URL
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

  const handleCropChange = (_newCrop: Crop, percentCrop: PercentCrop) => {
    setPercentCrop(percentCrop);
  };

  const handleRotate = (direction: "left" | "right") => {
    return () => {
      const newRotation =
        (rotation + (direction === "left" ? -90 : 90) + 360) % 360;

      setRotation(newRotation);
      setLastRotateDirection(direction);
    };
  };

  useEffect(() => {
    if (onChange) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (originalImgRef.current) {
          getCroppedImg(originalImgRef.current, percentCrop, rotation).then(
            (newImage) => {
              onChange(newImage, rotatedImage);
            }
          );
        }
      }, 100);
    }
  }, [percentCrop, rotation, onChange, getCroppedImg, rotatedImage]);

  function rotateCrop(
    crop: PercentCrop,
    direction: "left" | "right"
  ): PercentCrop {
    // if (!crop) return crop

    const { x, y, width, height, unit } = crop;
    return {
      y: direction === "left" ? 100 - (x + width) : x,
      x: direction === "left" ? y : 100 - (y + height),
      width: height,
      height: width,
      unit,
    };
  }
  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }
    if (originalImgRef.current) {
      getCroppedImg(originalImgRef.current, cropFull, rotation).then(
        (newImage) => {
          setRotatedImage(newImage);
          if (imgRef.current && lastRotateDirection) {
            const newCrop = rotateCrop(percentCrop, lastRotateDirection);
            setPercentCrop(newCrop);
          }
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotation]);

  useEffect(() => {
    setTimeout(() => {
      setImageEditorKey(Number(!imageEditorKey));
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotatedImage]);

  return (
    <div className="flex flex-col items-center">
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img src={image} ref={originalImgRef} className="hidden" />
      <ReactCrop
        crop={percentCrop}
        onChange={handleCropChange}
        minWidth={50}
        minHeight={50}
        className="max-h-[70vh] h-auto max-w-full w-auto"
        key={imageEditorKey}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={rotatedImage} key={rotatedImage} ref={imgRef} />
      </ReactCrop>
      <div className="flex justify-center mt-3">
        <Button variant="outline" size="icon" onClick={handleRotate("left")}>
          <Icons.rotateLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="ml-2"
          onClick={handleRotate("right")}
        >
          <Icons.rotateRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ImageEditor;
