import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Award } from "lucide-react";

const Certificate = () => {
  const { courseId } = useParams();
  const [certificate, setCertificate] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    loadCertificate();
  }, [courseId]);

  const loadCertificate = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId || !courseId) return;

    try {
      const [certRes, userRes, courseRes] = await Promise.all([
        fetch(`http://localhost:8080/api/quizzes/certificate/${userId}/${courseId}`),
        fetch(`http://localhost:8080/api/auth/user/${userId}`),
        fetch(`http://localhost:8080/api/courses/${courseId}/detail?userId=${userId}`)
      ]);
      
      if (certRes.ok) {
        const certData = await certRes.json();
        const userData = await userRes.json();
        const courseData = await courseRes.json();
        setCertificate(certData);
        setUser(userData);
        setCourse(courseData);
      }
    } catch (error) {
      console.error("Error loading certificate:", error);
    }
  };

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement du certificat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-2xl p-12 max-w-4xl w-full border-8 border-double border-primary/20">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-accent/20 to-accent/10">
              <Award className="h-20 w-20 text-accent" />
            </div>
          </div>

          <div>
            <h1 className="text-5xl font-bold text-primary mb-2">Certificat de Réussite</h1>
            <p className="text-muted-foreground">Ce certificat atteste que</p>
          </div>

          <div className="py-4">
            <h2 className="text-4xl font-bold mb-2">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-lg text-muted-foreground">a complété avec succès le cours</p>
          </div>

          <div className="py-4 border-t border-b border-border">
            <h3 className="text-3xl font-semibold text-secondary">{course?.title}</h3>
          </div>

          <div className="flex justify-between items-end pt-8">
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Date d'émission</p>
              <p className="font-semibold">
                {new Date(certificate.issuedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Numéro de certificat</p>
              <p className="font-mono font-semibold">{certificate.certificateNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Instructeur</p>
              <p className="font-semibold">{course?.instructor}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
