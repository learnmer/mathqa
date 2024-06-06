import React, { useRef, useState } from "react";
import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { ocr, solve } from "../lib/gemini";
import { useFetcher } from "@remix-run/react";
import { Button } from "../../@/components/ui/button";
import { Icons } from "../../@/components/ui/Icon";
import { Input } from "../../@/components/ui/input";
import { Label } from "../../@/components/ui/label";
import {
  TypographyH1,
  TypographyH2,
  TypographyP,
} from "../../@/components/ui/typography";
import Markdown from "react-markdown";
import ImageEditor from "../components/ImageEditor";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../@/components/ui/dialog";

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const task = formData.get("task")?.toString() as string;
  if (task === "ocr") {
    const data = formData.get("data")?.toString() as string;
    const mimeType = formData.get("mimeType")?.toString() as string;
    if (!data) return "";

    const result = await ocr({ inlineData: { data, mimeType } });
    return result;
  }
  if (task === "solve") {
    const data = formData.get("problem") as string;
    if (!data) return "";

    const result = await solve(data);
    return result;
  }
}

export const meta: MetaFunction = () => {
  return [
    { title: "Math problem solver" },
    {
      name: "description",
      content: "Upload an image and extract text from it",
    },
  ];
};

export default function Index() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const ocrFetcher = useFetcher();
  const solveFetcher = useFetcher();
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [editedImageDataUrl, setEditedImageDataUrl] = useState<string | null>(
    null
  );

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files?.[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          // Store the data URL for displaying the image
          setImageDataUrl(reader.result.toString());
          setEditedImageDataUrl(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editedImageDataUrl) {
      const [dataDesc, imageText] = editedImageDataUrl.split(",");
      // get the mimeType from something like data:image/png;base64
      const mimeType = dataDesc.split(":")[1].split(";")[0];

      ocrFetcher.submit(
        { data: imageText, mimeType, task: "ocr" },
        {
          method: "POST",
        }
      );
    }
  };

  return (
    <div className="font-sans m-10">
      <TypographyH1>Math Problem Solver</TypographyH1>
      <form
        encType="multipart/form-data"
        onSubmit={handleSubmit}
        className="mt-3"
      >
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleChange}
            ref={fileInputRef}
            name="image"
          />
        </div>

        {imageDataUrl && (
          <div className="relative mt-3 w-fit">
            {/*eslint-disable-next-line jsx-a11y/img-redundant-alt*/}
            <img src={imageDataUrl} alt="Uploaded Image" className="max-h-80" />
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-2 right-2"
                >
                  <Icons.edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[100vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Edit Image</DialogTitle>
                </DialogHeader>
                <div className="max-h-full">
                  <ImageEditor
                    image={imageDataUrl}
                    onChange={setEditedImageDataUrl}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="submit"
                      onClick={() => setImageDataUrl(editedImageDataUrl)}
                      className="text-lg"
                    >
                      Save Image
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      type="submit"
                      onClick={() => setEditedImageDataUrl(imageDataUrl)}
                      className="text-lg"
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
        <Button type="submit" className="mt-3">
          Extract Text
        </Button>
      </form>
      {ocrFetcher.state === "submitting" ? (
        <Icons.spinner className="h-10 w-10 animate-spin" />
      ) : (
        (ocrFetcher.data as string) && (
          <div className="mt-3">
            <TypographyH2>Extracted Text:</TypographyH2>
            <TypographyP className="whitespace-pre-wrap">
              {ocrFetcher.data as string}
            </TypographyP>
          </div>
        )
      )}
      {ocrFetcher.state !== "submitting" && (
        <React.Fragment>
          {(ocrFetcher.data as string) && (
            <Button
              className="mt-3"
              onClick={() => {
                solveFetcher.submit(
                  { problem: ocrFetcher.data as string, task: "solve" },
                  {
                    method: "POST",
                  }
                );
              }}
            >
              Solve the problem
            </Button>
          )}
          {solveFetcher.state === "submitting" ? (
            <Icons.spinner className="h-10 w-10 animate-spin" />
          ) : (
            (solveFetcher.data as string) && (
              <div className="mt-3">
                <TypographyH2>Solution:</TypographyH2>
                <TypographyP className="whitespace-pre-wrap">
                  <Markdown>{solveFetcher.data as string}</Markdown>
                </TypographyP>
              </div>
            )
          )}
        </React.Fragment>
      )}
    </div>
  );
}
