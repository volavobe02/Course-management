import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { courseApi, CourseResponse, Category } from "@/services/api";
import { useSearchParams } from "react-router-dom";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [allCourses, setAllCourses] = useState<CourseResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, totalTime: '', avgProgress: 0 });
  
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      const filtered = allCourses.filter(c => 
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
      );
      setCourses(filtered);
    } else {
      setCourses(allCourses);
    }
  }, [searchParams, allCourses]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const [coursesData, categoriesData] = await Promise.all([
        courseApi.getAllCourses(),
        courseApi.getAllCategories(),
      ]);
      setAllCourses(coursesData);
      setCourses(coursesData);
      setCategories(categoriesData);
      
      if (userId) {
        const enrollmentsRes = await fetch(`http://localhost:8080/api/enrollments/user/${userId}`);
        const enrollments = await enrollmentsRes.json();
        
        const completed = enrollments.filter((e: any) => e.progress === 100).length;
        const totalProgress = enrollments.reduce((sum: number, e: any) => sum + e.progress, 0);
        const avgProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;
        
        let totalMinutes = 0;
        for (const enrollment of enrollments) {
          const courseRes = await fetch(`http://localhost:8080/api/courses/${enrollment.course.id}/detail?userId=${userId}`);
          const courseData = await courseRes.json();
          
          for (const module of courseData.modules) {
            for (const lesson of module.lessons) {
              if (lesson.completed) {
                const [mins, secs] = lesson.duration.split(':').map(Number);
                totalMinutes += mins + (secs / 60);
              }
            }
          }
        }
        
        const hours = Math.floor(totalMinutes / 60);
        const mins = Math.round(totalMinutes % 60);
        const timeStr = hours > 0 ? `${hours}h` : mins > 0 ? `${mins}min` : '0min';
        
        setStats({
          enrolled: enrollments.length,
          completed,
          totalTime: timeStr,
          avgProgress
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    try {
      const coursesData = categoryId
        ? await courseApi.getCoursesByCategory(categoryId)
        : await courseApi.getAllCourses();
      setAllCourses(coursesData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary to-secondary p-8 md:p-12 text-primary-foreground shadow-[var(--shadow-strong)]">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Développez vos compétences avec les meilleurs cours en ligne
            </h1>
            <p className="text-lg text-primary-foreground/90">
              Accédez à plus de 10,000 cours créés par des experts du monde entier
            </p>
            <Button size="lg" variant="accent" className="mt-4">
              Commencer maintenant
            </Button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-l from-background/50 to-transparent" />
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 border border-primary/20 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Cours suivis</p>
              <p className="text-3xl font-bold">{stats.enrolled}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <BookOpen className="h-24 w-24" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 border border-secondary/20 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Temps d'apprentissage</p>
              <p className="text-3xl font-bold">{stats.totalTime}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <Clock className="h-24 w-24" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 p-6 border border-accent/20 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Award className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Certificats</p>
              <p className="text-3xl font-bold">{stats.completed}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <Award className="h-24 w-24" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6 border border-primary/20 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Progression</p>
              <p className="text-3xl font-bold">{stats.avgProgress}%</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <TrendingUp className="h-24 w-24" />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Explorer par catégorie</h2>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all px-4 py-2 text-sm"
              onClick={() => handleCategoryClick(null)}
            >
              Tous
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all px-4 py-2 text-sm"
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </section>

        {/* Courses Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Cours populaires</h2>
            <Button variant="ghost">Voir tout</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p>Chargement...</p>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))
            ) : (
              <p>Aucun cours disponible</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
