import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const mockQuizData = {
  id: "1",
  title: "Quiz HTML - Les bases",
  duration: 15,
  questions: [
    {
      id: "1",
      question: "Que signifie HTML ?",
      options: [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
        "Hyperlinks and Text Markup Language"
      ],
      correctAnswer: 0
    },
    {
      id: "2",
      question: "Quelle balise est utilisée pour créer un lien hypertexte ?",
      options: ["<link>", "<a>", "<href>", "<url>"],
      correctAnswer: 1
    },
    {
      id: "3",
      question: "Quelle balise définit le titre principal d'une page ?",
      options: ["<header>", "<title>", "<h1>", "<head>"],
      correctAnswer: 2
    },
    {
      id: "4",
      question: "Comment créer une liste non ordonnée ?",
      options: ["<ol>", "<list>", "<ul>", "<nl>"],
      correctAnswer: 2
    },
    {
      id: "5",
      question: "Quelle balise est utilisée pour insérer une image ?",
      options: ["<img>", "<image>", "<pic>", "<src>"],
      correctAnswer: 0
    }
  ]
};

const TakeQuiz = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadQuiz();
  }, [quizId]);
  
  const loadQuiz = async () => {
    try {
      const [quizRes, questionsRes] = await Promise.all([
        fetch(`http://localhost:8080/api/quizzes/${quizId}`),
        fetch(`http://localhost:8080/api/quizzes/${quizId}/questions`)
      ]);
      const quizData = await quizRes.json();
      const questionsData = await questionsRes.json();
      
      setQuiz(quizData);
      
      const formattedQuestions = questionsData.map((q: any) => ({
        id: q.id.toString(),
        question: q.question,
        options: [q.option1, q.option2, q.option3, q.option4],
        correctAnswer: q.correctAnswer
      }));
      
      setQuestions(formattedQuestions);
      setTimeLeft(15 * 60);
      setLoading(false);
    } catch (error) {
      toast.error("Erreur lors du chargement du quiz");
    }
  };

  useEffect(() => {
    if (timeLeft === 0 || questions.length === 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, questions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / questions.length) * 100);
    const userId = localStorage.getItem("userId");
    
    try {
      await fetch(`http://localhost:8080/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId!), score })
      });
      
      toast.success("Quiz terminé!");
      const courseId = quiz?.course?.id;
      navigate(`/quiz/${quizId}/results`, { state: { score, answers, questions, courseId } });
    } catch (error) {
      toast.error("Erreur lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container px-4 py-8">Chargement...</div>
      </div>
    );
  }
  
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Quiz</h1>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-primary" />
              <span className={timeLeft < 60 ? "text-destructive" : ""}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} sur {questions.length}</span>
              <span>{Math.round(progress)}% complété</span>
            </div>
            <Progress value={progress} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={answers[currentQ.id]?.toString() || ""}
              onValueChange={(value) => handleAnswerSelect(currentQ.id, parseInt(value))}
            >
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      answers[currentQ.id] === index
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleAnswerSelect(currentQ.id, index)}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Précédent
              </Button>

              <div className="flex gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      answers[questions[index].id] !== undefined
                        ? "bg-secondary text-secondary-foreground"
                        : index === currentQuestion
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!allAnswered || isSubmitting}
                  variant="hero"
                  className="gap-2"
                >
                  {isSubmitting ? "Soumission..." : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Terminer le quiz
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={currentQuestion === questions.length - 1}
                >
                  Suivant
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {!allAnswered && (
          <Card className="mt-4 border-accent">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                💡 Astuce: Vous devez répondre à toutes les questions avant de terminer le quiz.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TakeQuiz;
