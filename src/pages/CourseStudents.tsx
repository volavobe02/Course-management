import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";

const CourseStudents = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, [courseId]);

  const loadStudents = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/enrollments/course/${courseId}/students`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des étudiants");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/teacher/courses")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux cours
          </Button>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Étudiants inscrits</h1>
              {!loading && <p className="text-muted-foreground">{students.length} étudiant(s) inscrit(s)</p>}
            </div>
          </div>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun étudiant inscrit pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {student.firstName[0]}{student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {student.firstName} {student.lastName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progression</span>
                      <Badge variant={student.progress === 100 ? "default" : "secondary"}>
                        {student.progress}%
                      </Badge>
                    </div>
                    <ProgressBar progress={student.progress} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Inscrit le {new Date(student.enrolledAt).toLocaleDateString('fr-FR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseStudents;
