import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, Calendar, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Conferences = () => {
  const navigate = useNavigate();
  const [conferences, setConferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsTeacher(role?.toLowerCase() === "teacher");
    loadConferences();
  }, []);

  const loadConferences = async () => {
    try {
      const role = localStorage.getItem("userRole");
      const userId = localStorage.getItem("userId");
      
      let url = 'http://localhost:8080/api/conferences/available';
      if (role?.toLowerCase() === "teacher" && userId) {
        url = `http://localhost:8080/api/conferences/teacher/${userId}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setConferences(data);
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{isTeacher ? "Mes visioconférences" : "Visioconférences disponibles"}</h1>
            <p className="text-muted-foreground text-lg">{isTeacher ? "Gérez vos sessions" : "Rejoignez les sessions en direct"}</p>
          </div>
          {isTeacher && (
            <Button onClick={() => navigate('/teacher/create-conference')}>
              Créer une visio
            </Button>
          )}
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : conferences.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucune visioconférence disponible</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferences.map((conf) => (
              <Card key={conf.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <Badge>{conf.status}</Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{conf.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{conf.description}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{conf.teacher.firstName} {conf.teacher.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(conf.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{conf.duration} minutes</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/conference/${conf.id}`)}
                  >
                    {isTeacher ? "Démarrer" : "Rejoindre"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Conferences;
