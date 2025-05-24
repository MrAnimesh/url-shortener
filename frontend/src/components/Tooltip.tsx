// Tooltip.tsx
type TooltipProps = {
    text: string;
    children: React.ReactNode;
  };
  
  export default function Tooltip({ text, children }: TooltipProps) {
    return (
      <div className="relative group inline-block">
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          {text}
        </span>
        {children}
      </div>
    );
  }
  