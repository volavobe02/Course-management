import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Video, Users, Clock } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { courseApi } from "@/services/api";
import { toast } from "sonner";
import { StarRating } from "@/components/StarRating";

const TeacherCourses = () => {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      const filtered = allCourses.filter(c => 
        c.title.toLowerCase().includes(search.toLowerCase())
      );
      setCourses(filtered);
    } else {
      setCourses(allCourses);
    }
  }, [searchParams, allCourses]);
  
  useEffect(() => {
    loadCourses();
  }, []);
  
  const loadCourses = async () => {
    const teacherId = localStorage.getItem("userId");
    if (!teacherId) {
      toast.error("Vous devez être connecté");
      return;
    }
    
    try {
      const data = await courseApi.getTeacherCourses(parseInt(teacherId));
      const coursesWithStudents = await Promise.all(
        data.map(async (course: any) => {
          const [studentsRes, reviewsRes] = await Promise.all([
            fetch(`http://localhost:8080/api/enrollments/course/${course.id}/students`),
            fetch(`http://localhost:8080/api/reviews/course/${course.id}`)
          ]);
          const students = await studentsRes.json();
          const reviews = await reviewsRes.json();
          const avgRating = reviews.length > 0 
            ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length 
            : 0;
          return { ...course, studentsCount: students.length, rating: avgRating, reviewCount: reviews.length };
        })
      );
      setAllCourses(coursesWithStudents);
      setCourses(coursesWithStudents);
    } catch (error) {
      toast.error("Erreur lors du chargement des cours");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (courseId: number) => {
    try {
      await fetch(`http://localhost:8080/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      toast.success("Cours supprimé");
      setDeleteId(null);
      loadCourses();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Mes Cours</h1>
            <p className="text-muted-foreground">Gérez vos cours et créez-en de nouveaux</p>
          </div>
          <Link to="/teacher/create-course">
            <Button size="lg" className="gap-2" variant="hero">
              <Plus className="h-5 w-5" />
              Créer un cours
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p>Chargement...</p>
          ) : courses.length === 0 ? (
            <p>Aucun cours créé</p>
          ) : courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-[var(--shadow-medium)] transition-all">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-3 right-3">
                  Publié
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={Math.round(course.rating)} readonly size="sm" />
                  <span className="text-sm font-semibold">{course.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({course.reviewCount} avis)</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.studentsCount} étudiants
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2">
                <div className="flex gap-2 w-full">
                  <Link to={`/teacher/course/${course.id}/content`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2" size="sm">
                      Contenu
                    </Button>
                  </Link>
                  <Link to={`/teacher/edit-course/${course.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2" size="sm">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(course.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 w-full">
                  <Link to={`/teacher/create-quiz/${course.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2" size="sm">
                      Quiz
                    </Button>
                  </Link>
                  <Link to={`/teacher/course/${course.id}/students`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2" size="sm">
                      <Users className="h-4 w-4" />
                      Étudiants
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
            <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle className="text-destructive">Supprimer le cours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>
                    Annuler
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleDelete(deleteId)}>
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherCourses;
