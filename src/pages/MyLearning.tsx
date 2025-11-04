import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const oldEnrolledCourses = [
  {
    id: "1",
    title: "Développement Web Complet - HTML, CSS, JavaScript",
    instructor: "Marie Dubois",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    rating: 4.8,
    students: 12543,
    duration: "40h",
    level: "Débutant",
    category: "Développement",
    progress: 35,
  },
  {
    id: "2",
    title: "Design UX/UI Moderne - Figma & Wireframing",
    instructor: "Pierre Martin",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    rating: 4.9,
    students: 8234,
    duration: "25h",
    level: "Intermédiaire",
    category: "Design",
    progress: 68,
  },
  {
    id: "5",
    title: "React & TypeScript - Applications Web Modernes",
    instructor: "Lucas Moreau",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    rating: 4.9,
    students: 11234,
    duration: "45h",
    level: "Intermédiaire",
    category: "Développement",
    progress: 12,
  },
];

const oldCompletedCourses = [
  {
    id: "7",
    title: "Introduction à Git et GitHub",
    instructor: "Sophie Martin",
    thumbnail: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80",
    rating: 4.7,
    students: 9876,
    duration: "8h",
    level: "Débutant",
    category: "Développement",
    completedDate: "15 Mars 2024",
  },
];

const MyLearning = () => {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadEnrollments();
  }, []);
  
  const loadEnrollments = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/enrollments/user/${userId}`);
      const enrollments = await response.json();
      
      const coursesData = await Promise.all(
        enrollments.map(async (enrollment: any) => {
          const courseRes = await fetch(`http://localhost:8080/api/courses/${enrollment.course.id}/detail?userId=${userId}`);
          return courseRes.json();
        })
      );
      
      const inProgress = coursesData.filter(c => c.progress < 100);
      const completed = coursesData.filter(c => c.progress === 100);
      
      setEnrolledCourses(inProgress);
      setCompletedCourses(completed);
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-8">Chargement...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Mon apprentissage</h1>
          <p className="text-muted-foreground text-lg">
            Suivez vos progrès et continuez votre formation
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Cours actifs</p>
                  <p className="text-3xl font-bold">{enrolledCourses.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Cours terminés</p>
                  <p className="text-3xl font-bold">{completedCourses.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/10 to-accent/10">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Jours d'affilée</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="in-progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="in-progress">En cours</TabsTrigger>
            <TabsTrigger value="completed">Terminés</TabsTrigger>
            <TabsTrigger value="saved">Sauvegardés</TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="space-y-4">
            {enrolledCourses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun cours en cours</p>
            ) : enrolledCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-[var(--shadow-medium)] transition-all group">
                <div className="grid md:grid-cols-[220px_1fr] md:h-[180px]">
                  <div className="relative aspect-video md:aspect-auto md:h-[180px] overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm">
                      {course.level}
                    </Badge>
                  </div>
                  
                  <div className="p-4 flex flex-col justify-between h-[180px]">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{course.instructor}</p>
                        <h3 className="text-lg font-semibold hover:text-primary cursor-pointer transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="font-semibold">{course.progress}%</span>
                        </div>
                        <ProgressBar progress={course.progress} />
                      </div>
                    </div>
                    
                    <Button className="w-auto self-start" onClick={() => navigate(`/course/${course.id}`)}>
                      Continuer le cours
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedCourses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun cours terminé</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden group hover:shadow-[var(--shadow-medium)] transition-shadow">
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden aspect-video">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      />
                      <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
                        Terminé
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {course.instructor}
                      </p>
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {course.title}
                      </h3>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => navigate(`/certificate/${course.id}`)}>
                      Voir le certificat
                    </Button>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: "4",
                  title: "Marketing Digital - SEO, Social Media & Analytics",
                  instructor: "Thomas Bernard",
                  thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
                  rating: 4.6,
                  students: 9876,
                  duration: "30h",
                  level: "Débutant",
                  category: "Marketing",
                }
              ].map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  instructor={course.instructor}
                  thumbnail={course.thumbnail}
                  rating={course.rating}
                  students={course.students}
                  duration={course.duration}
                  level={course.level}
                  category={course.category}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyLearning;
