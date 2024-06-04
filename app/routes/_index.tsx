import React, { useRef } from "react";
import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { ocr, solve } from "../../lib/gemini";
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

export async function action({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const task = searchParams.get("task");
  if (task === "ocr") {
    const formData = await request.formData();
    const data = formData.get("data")?.toString() as string;
    const mimeType = formData.get("mimeType")?.toString() as string;
    if (!data) return "";

    const result = await ocr({ inlineData: { data, mimeType } });
    return result;
  }
  if (task === "solve") {
    const formData = await request.formData();
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

  const handleSubmit = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          // The result attribute contains the data URL as a base64 string
          const imageText = reader.result.toString().split(",")[1];
          const formData = new FormData();
          formData.append("data", imageText);
          formData.append("mimeType", file.type);
          ocrFetcher.submit(formData, {
            method: "POST",
            action: "/?index=&_data=routes%2F_index&task=ocr",
          });
        }
      };
      reader.readAsDataURL(file); // Converts file to base64 string
    }
  };

  return (
    <div className="font-sans m-10 ">
      <TypographyH1>Math Problem Solver</TypographyH1>
      <form
        encType="multipart/form-data"
        onSubmit={handleSubmit}
        className="mt-3"
      >
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Image</Label>
          <Input type="file" accept="image/*" ref={fileInputRef} name="image" />
        </div>
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
                  { problem: ocrFetcher.data as string },
                  {
                    method: "POST",
                    action: "/?index=&_data=routes%2F_index&task=solve",
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
