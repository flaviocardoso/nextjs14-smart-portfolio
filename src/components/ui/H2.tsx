import { cn } from "@/lib/utils";

export function H2({ className, ...props }: React.HTMLProps<HTMLHeadingElement>) {
  return <h2 
  {...props} 
  className={cn("text-2xl font-semibold tracking-tight", className)} 
  />;
}
