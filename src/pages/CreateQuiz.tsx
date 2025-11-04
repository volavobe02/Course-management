import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, GripVertical } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof QuizQuestion, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const duration = formData.get('duration') as string;
    
    try {
      const quizRes = await fetch('http://localhost:8080/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: parseInt(courseId!),
          title,
          questionCount: questions.length,
          duration: duration + ' min'
        })
      });
      
      const quiz = await quizRes.json();
      
      for (const question of questions) {
        await fetch('http://localhost:8080/api/quizzes/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizId: quiz.id,
            question: question.question,
            option1: question.options[0],
            option2: question.options[1],
            option3: question.options[2],
            option4: question.options[3],
            correctAnswer: question.correctAnswer
          })
        });
      }
      
      toast.success("Quiz créé avec succès!");
      navigate(`/teacher/courses`);
    } catch (error) {
      toast.error("Erreur lors de la création du quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Créer un quiz</h1>
          <p className="text-muted-foreground">Ajoutez des questions à votre quiz</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du quiz */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du quiz</CardTitle>
              <CardDescription>Détails de base de votre quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du quiz</Label>
                <Input 
                  id="title" 
                  placeholder="Ex: Quiz HTML - Les bases" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (minutes)</Label>
                  <Input 
                    id="duration" 
                    type="number"
                    placeholder="Ex: 15" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passingScore">Score minimum (%)</Label>
                  <Input 
                    id="passingScore" 
                    type="number"
                    placeholder="Ex: 70" 
                    min="0"
                    max="100"
                    required 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>Ajoutez les questions de votre quiz</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">Aucune question ajoutée</p>
                  <Button type="button" variant="outline" onClick={addQuestion} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter la première question
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={question.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 pt-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                          <span className="font-semibold text-muted-foreground">#{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`question-${question.id}`}>Question</Label>
                            <Input 
                              id={`question-${question.id}`}
                              placeholder="Entrez votre question"
                              value={question.question}
                              onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>Options de réponse</Label>
                            <RadioGroup 
                              value={question.correctAnswer.toString()}
                              onValueChange={(value) => updateQuestion(question.id, "correctAnswer", parseInt(value))}
                            >
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <RadioGroupItem value={optionIndex.toString()} id={`q${question.id}-opt${optionIndex}`} />
                                  <Input 
                                    placeholder={`Option ${optionIndex + 1}`}
                                    value={option}
                                    onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                    required
                                    className="flex-1"
                                  />
                                  <Label htmlFor={`q${question.id}-opt${optionIndex}`} className="text-xs text-muted-foreground whitespace-nowrap">
                                    Correcte
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        </div>

                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeQuestion(question.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/teacher/courses")}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || questions.length === 0} variant="hero">
              {isLoading ? "Création..." : "Créer le quiz"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateQuiz;
