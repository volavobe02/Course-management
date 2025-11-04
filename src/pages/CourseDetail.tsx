import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressBar } from "@/components/ProgressBar";
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Award, 
  FileText, 
  Download,
  CheckCircle2,
  Lock
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { StarRating } from "@/components/StarRating";

const courseModules = [
  {
    id: 1,
    title: "Introduction au développement web",
    lessons: [
      { id: 1, title: "Bienvenue dans le cours", duration: "5:30", completed: true, locked: false },
      { id: 2, title: "Configuration de l'environnement", duration: "12:45", completed: true, locked: false },
      { id: 3, title: "Les bases du HTML", duration: "18:20", completed: false, locked: false },
    ],
  },
  {
    id: 2,
    title: "HTML Avancé",
    lessons: [
      { id: 4, title: "Formulaires HTML", duration: "15:30", completed: false, locked: false },
      { id: 5, title: "Sémantique HTML5", duration: "20:15", completed: false, locked: false },
      { id: 6, title: "Accessibilité web", duration: "22:40", completed: false, locked: true },
    ],
  },
  {
    id: 3,
    title: "CSS & Styling",
    lessons: [
      { id: 7, title: "Introduction au CSS", duration: "16:20", completed: false, locked: true },
      { id: 8, title: "Flexbox et Grid", duration: "25:30", completed: false, locked: true },
      { id: 9, title: "Animations CSS", duration: "19:45", completed: false, locked: true },
    ],
  },
];

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  
  useEffect(() => {
    loadCourse();
  }, [id]);
  
  const loadCourse = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId || !id) return;
    
    try {
      const [courseRes, reviewsRes, contentRes, quizzesRes] = await Promise.all([
        fetch(`http://localhost:8080/api/courses/${id}/detail?userId=${userId}`),
        fetch(`http://localhost:8080/api/reviews/course/${id}`),
        fetch(`http://localhost:8080/api/courses/${id}/content`),
        fetch(`http://localhost:8080/api/quizzes/course/${id}?userId=${userId}`)
      ]);
      const courseData = await courseRes.json();
      const reviewsData = await reviewsRes.json();
      const contentData = await contentRes.json();
      const quizzesData = await quizzesRes.json();
      setCourse(courseData);
      setReviews(reviewsData);
      setObjectives(contentData.objectives || []);
      setResources(contentData.resources || []);
      setQuizzes(quizzesData);
    } catch (error) {
      toast.error("Erreur lors du chargement du cours");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="container px-4 py-8">Chargement...</div></div>;
  if (!course) return <div className="min-h-screen bg-background"><Navbar /><div className="container px-4 py-8">Cours introuvable</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8 space-y-8">
        {/* Video Player Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              {currentVideo ? (
                <video
                  key={currentVideo}
                  controls
                  className="w-full aspect-video bg-black"
                  src={currentVideo}
                  onEnded={async () => {
                    if (course.enrollmentId && currentLessonId) {
                      try {
                        await fetch(`http://localhost:8080/api/enrollments/${course.enrollmentId}/lessons/${currentLessonId}/complete`, {
                          method: 'POST',
                        });
                        toast.success("Leçon terminée !");
                        loadCourse();
                      } catch (error) {
                        console.error('Error marking lesson complete:', error);
                      }
                    }
                  }}
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              ) : (
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <div className="relative z-10 text-center">
                    <Play className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Sélectionnez une leçon pour commencer</p>
                  </div>
                </div>
              )}
            </Card>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge>{course.category}</Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <h1 className="text-3xl font-bold">
                    {course.title}
                  </h1>
                  <p className="text-muted-foreground">
                    Par {course.instructor}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="font-semibold">{course.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({course.reviewCount} avis)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>{course.students} étudiants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{course.duration}</span>
                </div>
              </div>

              {course.isEnrolled ? (
                <ProgressBar progress={course.progress} />
              ) : (
                <Button 
                  size="lg" 
                  variant="hero"
                  onClick={async () => {
                    const userId = localStorage.getItem("userId");
                    if (!userId) {
                      toast.error("Vous devez être connecté");
                      return;
                    }
                    try {
                      await fetch(`http://localhost:8080/api/enrollments?userId=${userId}&courseId=${id}`, {
                        method: 'POST',
                      });
                      toast.success("Inscription réussie !");
                      loadCourse();
                    } catch (error) {
                      toast.error("Erreur lors de l'inscription");
                    }
                  }}
                >
                  S'inscrire au cours
                </Button>
              )}
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="resources">Ressources</TabsTrigger>
                <TabsTrigger value="quizzes">Quiz</TabsTrigger>
                <TabsTrigger value="reviews">Avis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">Description du cours</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>
                    
                    {objectives.length > 0 && (
                      <>
                        <h3 className="text-xl font-semibold pt-4">Ce que vous allez apprendre</h3>
                        <ul className="space-y-2">
                          {objectives.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="resources" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="p-6">
                    {resources.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Aucune ressource disponible</p>
                    ) : (
                      <div className="space-y-4">
                        {resources.map((resource) => (
                          <div key={resource.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{resource.name}</p>
                                <p className="text-sm text-muted-foreground">{resource.fileSize}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" onClick={async () => {
                              try {
                                const response = await fetch(`http://localhost:8080/api/files/download?path=${encodeURIComponent(resource.fileUrl)}`);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = resource.name;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                                toast.success('Téléchargement démarré');
                              } catch (error) {
                                toast.error('Erreur lors du téléchargement');
                              }
                            }}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="quizzes" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {course.progress < 100 && (
                        <div className="p-4 rounded-lg bg-muted/50 border border-border">
                          <p className="text-sm text-muted-foreground">
                            <Lock className="h-4 w-4 inline mr-2" />
                            Terminez toutes les vidéos du cours pour déverrouiller les quiz
                          </p>
                        </div>
                      )}
                      {quizzes.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">Aucun quiz disponible</p>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold">Quiz disponibles</h3>
                        {quizzes.map((quiz) => {
                          const isLocked = course.progress < 100;
                          return (
                            <div key={quiz.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`p-2 rounded-lg ${isLocked ? 'bg-muted-foreground/10' : 'bg-primary/10'}`}>
                                  <FileText className={`h-5 w-5 ${isLocked ? 'text-muted-foreground' : 'text-primary'}`} />
                                </div>
                                <div className="flex-1">
                                  <p className={`font-medium ${isLocked ? 'text-muted-foreground' : ''}`}>{quiz.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {quiz.questions} questions • {quiz.duration}
                                    {quiz.completed && quiz.score !== null && (
                                      <span className="ml-2 text-secondary font-medium">
                                        • Score: {quiz.score}%
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              {isLocked ? (
                                <Badge variant="outline" className="gap-1">
                                  <Lock className="h-3 w-3" />
                                  Verrouillé
                                </Badge>
                              ) : quiz.completed ? (
                                <Button size="sm" variant="outline" onClick={() => window.location.href = `/quiz/${quiz.id}/results`}>
                                  Voir les résultats
                                </Button>
                              ) : (
                                <Button size="sm" onClick={() => window.location.href = `/quiz/${quiz.id}`}>
                                  Commencer
                                </Button>
                              )}
                            </div>
                          );
                        })}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="pt-4 space-y-4">
                {course.isEnrolled && (
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <h3 className="text-xl font-semibold">Laisser un avis</h3>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Note</label>
                        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Commentaire</label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Partagez votre expérience..."
                        />
                      </div>
                      <Button
                        onClick={async () => {
                          const userId = localStorage.getItem("userId");
                          if (!userId || !rating) {
                            toast.error("Veuillez sélectionner une note");
                            return;
                          }
                          try {
                            await fetch(`http://localhost:8080/api/reviews`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                userId: parseInt(userId),
                                courseId: parseInt(id!),
                                rating,
                                comment,
                              }),
                            });
                            toast.success("Avis ajouté !");
                            setRating(0);
                            setComment("");
                            loadCourse();
                          } catch (error) {
                            toast.error("Erreur lors de l'ajout de l'avis");
                          }
                        }}
                      >
                        Publier l'avis
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">Avis des étudiants ({reviews.length})</h3>
                    {reviews.length === 0 ? (
                      <p className="text-muted-foreground">Aucun avis pour le moment</p>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">{review.userName}</span>
                              <StarRating rating={review.rating} readonly size="sm" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Course Content */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Contenu du cours</h3>
                {!course.isEnrolled ? (
                  <div className="text-center py-8">
                    <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Veuillez vous inscrire pour voir nos cours</p>
                    <Button 
                      variant="hero"
                      onClick={async () => {
                        const userId = localStorage.getItem("userId");
                        if (!userId) {
                          toast.error("Vous devez être connecté");
                          return;
                        }
                        try {
                          await fetch(`http://localhost:8080/api/enrollments?userId=${userId}&courseId=${id}`, {
                            method: 'POST',
                          });
                          toast.success("Inscription réussie !");
                          loadCourse();
                        } catch (error) {
                          toast.error("Erreur lors de l'inscription");
                        }
                      }}
                    >
                      S'inscrire maintenant
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {course.modules.map((module: any) => (
                    <div key={module.id} className="space-y-2">
                      <h4 className="font-medium text-sm">{module.title}</h4>
                      <div className="space-y-1">
                        {module.lessons.map((lesson: any) => (
                          <button
                            key={lesson.id}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left group"
                            disabled={lesson.locked}
                            onClick={() => {
                              if (!lesson.locked) {
                                setCurrentVideo(lesson.videoUrl);
                                setCurrentLessonId(lesson.id);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {lesson.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                              ) : lesson.locked ? (
                                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                              ) : (
                                <Play className="h-4 w-4 text-primary shrink-0 group-hover:text-secondary" />
                              )}
                              <span className={`text-sm truncate ${lesson.locked ? 'text-muted-foreground' : ''}`}>
                                {lesson.title}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 ml-2">
                              {lesson.duration}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Certificat de réussite</p>
                    <p className="text-sm text-muted-foreground">
                      Obtenez votre certificat à la fin
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;
