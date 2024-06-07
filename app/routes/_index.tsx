import React, { useEffect, useRef, useState } from "react";
import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { ocr, solve } from "../lib/gemini";
import { useFetcher } from "@remix-run/react";
import { Button } from "../../@/components/ui/button";
import { Icons } from "../../@/components/ui/Icon";
import { TypographyH1 } from "../../@/components/ui/typography";
// import Markdown from "react-markdown";
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
import { Textarea } from "../../@/components/ui/textarea";
import AssistantMessage from "../components/AssistantMessage";
import { SSE } from "sse.js";

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
    { title: "Learnmer MathQA" },
    {
      name: "description",
      content: "Upload an image and extract text from it",
    },
  ];
};

export default function Index() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const ocrFetcher = useFetcher<string>({ key: "ocr" });
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [editedImageDataUrl, setEditedImageDataUrl] = useState<string | null>(
    null
  );
  const [text, setText] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reRender, setReRender] = useState(false);
  const [isNewUpload, setIsNewUpload] = useState(false);
  const [typing, setTyping] = useState(false);
  const editorSendButtonRef = useRef<HTMLButtonElement | null>(null);
  const editorUploadButtonRef = useRef<HTMLButtonElement | null>(null);
  const editorImageDivRef = useRef<HTMLDivElement | null>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files?.[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          // Store the data URL for displaying the image
          setImageDataUrl(reader.result.toString());
          setEditedImageDataUrl(reader.result.toString());
          setDialogOpen(true);
          setIsNewUpload(true);
          // clear all files
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (event?: React.ChangeEvent<HTMLFormElement>) => {
    event?.preventDefault();
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

  useEffect(() => {
    if (ocrFetcher.data) {
      setText(ocrFetcher.data);
    }
  }, [ocrFetcher.data]);

  useEffect(() => {
    setTimeout(() => {
      setReRender(!reRender);
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageDataUrl]);

  return (
    <div className="font-sans m-10 flex flex-col items-center">
      <TypographyH1>Learnmer MathQA</TypographyH1>
      <div className="relative flex justify-center sm:w-[600px] w-full">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={ocrFetcher.state === "submitting"}
          className="mt-3 h-40"
          placeholder="Enter the problem here"
          minRows={6}
          addheight={
            Math.max(
              editorImageDivRef.current?.clientHeight || 0,
              editorSendButtonRef.current?.clientHeight || 0,
              editorUploadButtonRef.current?.clientHeight || 0
            ) + 10
          }
        />
        {ocrFetcher.state === "submitting" && (
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Icons.spinner className="h-10 w-10 animate-spin" />
          </div>
        )}
        <Button
          variant="default"
          size="sm"
          className="absolute bottom-2 right-2"
          disabled={!text || ocrFetcher.state === "submitting"}
          ref={editorSendButtonRef}
          onClick={() => {
            const sse = new SSE(`/solve?problem=${encodeURIComponent(text)}`, {
              start: false,
            });
            let response = "";
            setResponse("");
            sse.addEventListener("close", () => {
              sse.close();
              setTyping(false);
            });
            sse.onmessage = (event) => {
              response += JSON.parse(event.data);
              setResponse(response);
            };

            sse.stream();
            setTyping(true);
          }}
        >
          <Icons.send className="mr-2 h-4 w-4" />
          Ask
        </Button>
        {!imageDataUrl && (
          // upload image button
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-2 left-2"
            onClick={() => {
              fileInputRef.current?.click();
            }}
            ref={editorUploadButtonRef}
          >
            <Icons.image className="mr-2 h-4 w-4" />
            Use Image
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              ref={fileInputRef}
              name="image"
              className="hidden"
            />
          </Button>
        )}
        {imageDataUrl && (
          <div ref={editorImageDivRef} className="absolute bottom-3 left-3">
            <div className="relative mt-3 w-fit min-h-12 flex items-center">
              <a
                href="#image"
                onClick={(e) => {
                  e.preventDefault();
                  setDialogOpen(true);
                }}
              >
                {/*eslint-disable-next-line jsx-a11y/img-redundant-alt*/}
                <img
                  src={imageDataUrl}
                  alt="Uploaded Image"
                  className="sm:max-h-52 sm:max-w-64 max-h-32 max-w-48 border-orange-300 border-2 rounded-lg"
                  // show the image editor when clicked
                />
              </a>
              {/** add a button to remove the image */}
              <Button
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                variant="secondary"
                onClick={() => {
                  setImageDataUrl(null);
                  setEditedImageDataUrl(null);
                  // setText("");
                  // ocrFetcher.submit({ task: "ocr" }, { method: "POST" });
                  // solveFetcher.submit({ task: "solve" }, { method: "POST" });
                }}
              >
                <Icons.x className="h-4 w-4" />
              </Button>
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  if (open === false) {
                    setEditedImageDataUrl(imageDataUrl);
                    if (isNewUpload) {
                      handleSubmit();
                      setIsNewUpload(false);
                    }
                  }
                  setDialogOpen(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-7 w-7"
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
                        onClick={() => {
                          setImageDataUrl(editedImageDataUrl);
                          setTimeout(() => {
                            handleSubmit();
                            setIsNewUpload(false);
                          });
                        }}
                        className="text-lg"
                      >
                        Save Image
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        type="submit"
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
          </div>
        )}
      </div>
      {response && (
        <div className="mt-3 sm:w-[600px] w-full">
          <AssistantMessage typing={typing}>{response}</AssistantMessage>
        </div>
      )}
    </div>
  );
}
