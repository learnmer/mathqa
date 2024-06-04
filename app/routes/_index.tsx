import React, { useRef } from "react";
import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import ocr from "../../lib/ocr";
import { useFetcher } from "@remix-run/react";
import { Button } from "../../@/components/ui/button";
import { Icons } from "../../components/Icon";
import { Input } from "../../@/components/ui/input";
import { Label } from "../../@/components/ui/label";
import { TypographyH1, TypographyH2, TypographyP } from "../../@/components/ui/typography";

export async function action({ request }: LoaderFunctionArgs) {
  let formData;
  try {
    formData = await request.formData();
  } catch (e) {
    return "";
  }
  const data = formData.get("data")?.toString() as string;
  const mimeType = formData.get("mimeType")?.toString() as string;
  if (!data) return "";

  const result = ocr({ inlineData: { data, mimeType } });
  return result;
}

export const meta: MetaFunction = () => {
  return [
    { title: "Image to Text App" },
    {
      name: "description",
      content: "Upload an image and extract text from it",
    },
  ];
};

export default function Index() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fetcher = useFetcher();

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
          fetcher.submit(formData, { method: "POST" });
        }
      };
      reader.readAsDataURL(file); // Converts file to base64 string
    }
  };

  return (
    <div className="font-sans m-10 grid gap-5">
      <TypographyH1>Image to Text App</TypographyH1>
      <form encType="multipart/form-data" onSubmit={handleSubmit}>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Image</Label>
          <Input type="file" accept="image/*" ref={fileInputRef} name="image" />
        </div>
        <Button type="submit" className="mt-3">Extract Text</Button>
      </form>

      {fetcher.state === "submitting" ? (
        <Icons.spinner className="h-10 w-10 animate-spin" />
      ) : (
        (fetcher.data as string) && (
          <div>
            <TypographyH2>Extracted Text:</TypographyH2>
            <TypographyP className="whitespace-pre-wrap">{fetcher.data as string}</TypographyP>
          </div>
        )
      )}
    </div>
  );
}
