import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export const StatsCard = ({ title, value, icon: Icon, trend, trendUp }: StatsCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-[var(--shadow-medium)] transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p className={`text-sm font-medium ${trendUp ? 'text-secondary' : 'text-destructive'}`}>
                {trend}
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
