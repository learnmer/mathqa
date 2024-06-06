import { useMarkdownProcessor } from "../hooks/use-markdown-processor";
export default function AssistantMessage(props: { children: string }) {
  const { children } = props;
  const content = useMarkdownProcessor(children);
  return <div className="bg-green-100 rounded-md p-2">{content}</div>;
}
