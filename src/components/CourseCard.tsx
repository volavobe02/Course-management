import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: string | number;
  title: string;
  instructor: string;
  thumbnail: string;
  rating: number;
  students: number;
  duration: string;
  level: string;
  category: string;
}

export const CourseCard = ({
  id,
  title,
  instructor,
  thumbnail,
  rating,
  students,
  duration,
  level,
  category,
}: CourseCardProps) => {
  return (
    <Link to={`/course/${id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-[var(--shadow-medium)] hover:-translate-y-1 cursor-pointer h-full">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden aspect-video">
            <img
              src={thumbnail}
              alt={title}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
              {category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{instructor}</span>
            <Badge variant="outline">{level}</Badge>
          </div>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-medium">{rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{students.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
