import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, User, GraduationCap, BookOpen, Users } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authApi } from "@/services/api";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      const response = await authApi.login({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: '',
      });
      
      localStorage.setItem("userRole", response.role);
      localStorage.setItem("userId", response.userId.toString());
      localStorage.setItem("userName", response.firstName);
      toast.success(`Connexion réussie en tant que ${response.role === "TEACHER" ? "Professeur" : "Étudiant"}!`);
      navigate(response.role === "TEACHER" ? "/teacher/courses" : "/dashboard");
    } catch (error) {
      toast.error("Email ou mot de passe incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      await authApi.register({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        role: role.toUpperCase(),
      });
      
      toast.success("Compte créé avec succès! Veuillez vous connecter.");
      document.querySelector('[value="login"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      e.currentTarget.reset();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création du compte");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden lg:flex flex-col gap-6 p-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              LearnHub
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Transformez votre avenir avec l'apprentissage en ligne
            </h1>
            <p className="text-lg text-muted-foreground">
              Accédez à des milliers de cours créés par des experts du monde entier. 
              Apprenez à votre rythme et obtenez des certifications reconnues.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Cours disponibles</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-secondary">50K+</div>
              <div className="text-sm text-muted-foreground">Étudiants actifs</div>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="shadow-[var(--shadow-strong)]">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <CardTitle>Bon retour!</CardTitle>
                  <CardDescription>
                    Connectez-vous pour continuer votre apprentissage
                  </CardDescription>

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="nom@exemple.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm"
                  >
                    Mot de passe oublié?
                  </Button>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading} variant="hero">
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <CardTitle>Créer un compte</CardTitle>
                  <CardDescription>
                    Commencez votre parcours d'apprentissage aujourd'hui
                  </CardDescription>

                  
                  <div className="space-y-2">
                    <Label>Je suis</Label>
                    <RadioGroup value={role} onValueChange={(value) => setRole(value as "student" | "teacher")} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="signup-student" />
                        <Label htmlFor="signup-student" className="flex items-center gap-2 cursor-pointer">
                          <Users className="h-4 w-4" />
                          Étudiant
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="signup-teacher" />
                        <Label htmlFor="signup-teacher" className="flex items-center gap-2 cursor-pointer">
                          <BookOpen className="h-4 w-4" />
                          Professeur
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstName">Prénom</Label>
                      <Input
                        id="signup-firstName"
                        name="firstName"
                        type="text"
                        placeholder="Jean"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastName">Nom</Label>
                      <Input
                        id="signup-lastName"
                        name="lastName"
                        type="text"
                        placeholder="Dupont"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="nom@exemple.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading} variant="hero">
                    {isLoading ? "Création..." : "Créer mon compte"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
