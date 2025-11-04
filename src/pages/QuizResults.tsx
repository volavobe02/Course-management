import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Award, RotateCcw, Home, Download } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const QuizResults = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const location = useLocation();
  const { score, answers, questions, courseId } = location.state || { score: 85, answers: {}, questions: [], courseId: null };

  const isPassed = score >= 70;
  const correctAnswers = questions.filter((q: any) => answers[q.id] === q.correctAnswer).length;
  
  const downloadCertificate = () => {
    window.open(`/certificate/${courseId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Score Card */}
          <Card className={`border-2 ${isPassed ? 'border-secondary' : 'border-destructive'}`}>
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className={`inline-flex p-4 rounded-full ${isPassed ? 'bg-secondary/10' : 'bg-destructive/10'}`}>
                  <Award className={`h-16 w-16 ${isPassed ? 'text-secondary' : 'text-destructive'}`} />
                </div>
                
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {isPassed ? 'Félicitations! 🎉' : 'Quiz terminé'}
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    {isPassed 
                      ? 'Vous avez réussi le quiz avec succès!' 
                      : 'Continuez à pratiquer pour améliorer votre score.'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-8 py-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary mb-2">{score}%</div>
                    <div className="text-sm text-muted-foreground">Score final</div>
                  </div>
                  <div className="h-16 w-px bg-border" />
                  <div className="text-center">
                    <div className="text-5xl font-bold text-secondary mb-2">
                      {correctAnswers}/{questions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Réponses correctes</div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  {isPassed && courseId && (
                    <Button variant="secondary" onClick={downloadCertificate} className="gap-2">
                      <Download className="h-4 w-4" />
                      Télécharger le certificat
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => navigate(`/quiz/${quizId}`)} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Réessayer
                  </Button>
                  <Button variant="hero" onClick={() => navigate('/my-learning')} className="gap-2">
                    <Home className="h-4 w-4" />
                    Retour aux cours
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Détails des réponses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question: any, index: number) => {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect ? 'border-secondary/30 bg-secondary/5' : 'border-destructive/30 bg-destructive/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 mt-1" />
                      ) : (
                        <XCircle className="h-6 w-6 text-destructive shrink-0 mt-1" />
                      )}
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-muted-foreground">Question {index + 1}</span>
                            <Badge variant={isCorrect ? "default" : "destructive"}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                          </div>
                          <p className="font-medium text-lg">{question.question}</p>
                        </div>

                        <div className="space-y-2">
                          {question.options.map((option: string, optionIndex: number) => {
                            const isUserAnswer = userAnswer === optionIndex;
                            const isCorrectAnswer = question.correctAnswer === optionIndex;
                            
                            return (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border ${
                                  isCorrectAnswer
                                    ? 'border-secondary bg-secondary/10'
                                    : isUserAnswer
                                    ? 'border-destructive bg-destructive/10'
                                    : 'border-border bg-muted/50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrectAnswer && (
                                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  )}
                                  <span className={isCorrectAnswer || isUserAnswer ? 'font-medium' : ''}>
                                    {option}
                                  </span>
                                  {isUserAnswer && (
                                    <Badge variant="outline" className="ml-auto">
                                      Votre réponse
                                    </Badge>
                                  )}
                                  {isCorrectAnswer && (
                                    <Badge variant="outline" className="ml-auto bg-secondary/10">
                                      Bonne réponse
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default QuizResults;
