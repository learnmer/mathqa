import { useMarkdownProcessor } from "../hooks/use-markdown-processor";
export default function AssistantMessage(props: {
  children: string;
  typing?: boolean;
}) {
  const { children, typing } = props;
  const content = useMarkdownProcessor(children);
  return (
    <div className="bg-green-100 rounded-md p-2 grid grid-flow-row gap-3">
      {content}
      {typing && (
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce ml-1"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce ml-1"></div>
        </div>
      )}
    </div>
  );
}
