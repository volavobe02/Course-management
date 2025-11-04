import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export const StarRating = ({ rating, onRatingChange, readonly = false, size = "md" }: StarRatingProps) => {
  const [hover, setHover] = useState(0);
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-all duration-200 ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`${sizeClasses[size]} transition-colors duration-200 ${
              star <= (hover || rating)
                ? "fill-accent text-accent"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
};
