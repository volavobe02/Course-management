import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ProgressBar = ({ progress, showLabel = true, size = "md" }: ProgressBarProps) => {
  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3",
  };

  return (
    <div className="space-y-2">
      <Progress value={progress} className={heights[size]} />
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-medium text-primary">{progress}%</span>
        </div>
      )}
    </div>
  );
};
