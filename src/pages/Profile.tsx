import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, Clock, Mail, User, Upload, Users } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { fileApi } from "@/services/api";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, totalTime: '' });
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [uploading, setUploading] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  useEffect(() => {
    loadProfile();
  }, []);
  
  const loadProfile = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    try {
      const userRes = await fetch(`http://localhost:8080/api/users/${userId}`);
      const userData = await userRes.json();
      setUser(userData);
      setFirstName(userData.firstName);
      setLastName(userData.lastName);
      setEmail(userData.email);
      setBio(userData.bio || "");
      setAvatar(userData.avatar || "");
      setInterests(userData.interests ? userData.interests.split(',') : []);
      
      if (userData.role === 'TEACHER') {
        const coursesRes = await fetch(`http://localhost:8080/api/courses/teacher/${userId}`);
        const courses = await coursesRes.json();
        
        let totalStudents = 0;
        let totalRating = 0;
        let totalReviews = 0;
        
        for (const course of courses) {
          const [studentsRes, reviewsRes] = await Promise.all([
            fetch(`http://localhost:8080/api/enrollments/course/${course.id}/students`),
            fetch(`http://localhost:8080/api/reviews/course/${course.id}`)
          ]);
          const students = await studentsRes.json();
          const reviews = await reviewsRes.json();
          
          totalStudents += students.length;
          if (reviews.length > 0) {
            totalReviews += reviews.length;
            totalRating += reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
          }
        }
        
        const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : '0.0';
        
        setStats({
          enrolled: courses.length,
          completed: totalStudents,
          totalTime: avgRating
        });
        setBadges([]);
      } else {
        const enrollmentsRes = await fetch(`http://localhost:8080/api/enrollments/user/${userId}`);
        const enrollments = await enrollmentsRes.json();
        
        const completed = enrollments.filter((e: any) => e.progress === 100).length;
        
        let totalMinutes = 0;
        for (const enrollment of enrollments) {
          const courseRes = await fetch(`http://localhost:8080/api/courses/${enrollment.course.id}/detail?userId=${userId}`);
          const courseData = await courseRes.json();
          
          for (const module of courseData.modules) {
            for (const lesson of module.lessons) {
              if (lesson.completed) {
                const [mins, secs] = lesson.duration.split(':').map(Number);
                totalMinutes += mins + (secs / 60);
              }
            }
          }
        }
        
        const hours = Math.floor(totalMinutes / 60);
        const mins = Math.round(totalMinutes % 60);
        const timeStr = hours > 0 ? `${hours}h` : mins > 0 ? `${mins}min` : '0min';
        
        const calculatedBadges: string[] = [];
        
        if (completed >= 1) calculatedBadges.push('Débutant');
        if (completed >= 5) calculatedBadges.push('Assidu');
        if (completed >= 10) calculatedBadges.push('Expert');
        
        const advancedCompleted = enrollments.filter((e: any) => {
          const course = e.course;
          return e.progress === 100 && course.level === 'AVANCE';
        }).length;
        
        if (advancedCompleted >= 3) calculatedBadges.push('Maître');
        
        setStats({
          enrolled: enrollments.length,
          completed,
          totalTime: timeStr
        });
        setBadges(calculatedBadges);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    try {
      await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, bio, avatar, interests: interests.join(',') })
      });
      toast.success("Profil mis à jour avec succès!");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };
  
  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await fileApi.uploadFile(file);
      setAvatar(`http://localhost:8080${result.url}`);
      toast.success("Photo uploadée");
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };
  
  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };
  
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    const userId = localStorage.getItem("userId");
    try {
      await fetch(`http://localhost:8080/api/users/${userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      toast.success("Mot de passe modifié");
      setShowPasswordDialog(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Erreur lors du changement de mot de passe");
    }
  };
  
  const handleDeleteAccount = async () => {
    const userId = localStorage.getItem("userId");
    try {
      await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'DELETE'
      });
      localStorage.clear();
      toast.success("Compte supprimé");
      window.location.href = '/auth';
    } catch (error) {
      toast.error("Erreur lors de la suppression");
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
      
      <main className="container px-4 py-8 max-w-5xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground text-lg">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`} />
                    <AvatarFallback>{firstName[0]}{lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{firstName} {lastName}</h3>
                    <p className="text-sm text-muted-foreground">{user?.role === 'TEACHER' ? 'Professeur' : 'Étudiant'}</p>
                  </div>
                  <div className="relative w-full">
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarUpload(file);
                      }}
                    />
                    <Button variant="outline" size="sm" className="w-full" disabled={uploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      Changer la photo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{user?.role === 'TEACHER' ? 'Cours créés' : 'Cours suivis'}</span>
                  </div>
                  <span className="font-semibold">{stats.enrolled}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      {user?.role === 'TEACHER' ? <Users className="h-4 w-4 text-secondary" /> : <Award className="h-4 w-4 text-secondary" />}
                    </div>
                    <span className="text-sm">{user?.role === 'TEACHER' ? 'Étudiants' : 'Certificats'}</span>
                  </div>
                  <span className="font-semibold">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      {user?.role === 'TEACHER' ? <Award className="h-4 w-4 text-accent" /> : <Clock className="h-4 w-4 text-accent" />}
                    </div>
                    <span className="text-sm">{user?.role === 'TEACHER' ? 'Note moyenne' : 'Temps total'}</span>
                  </div>
                  <span className="font-semibold">{user?.role === 'TEACHER' ? stats.totalTime + '/5' : stats.totalTime}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Badges</CardTitle>
              </CardHeader>
              <CardContent>
                {badges.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Terminez des cours pour débloquer des badges</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <Badge key={badge} variant="outline" className="bg-primary/5">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="Prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        placeholder="Nom"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez-nous de vous..."
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <Button onClick={handleSave} variant="hero">
                  Enregistrer les modifications
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Préférences d'apprentissage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="interests">Centres d'intérêt</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Développement", "Design", "Marketing", "Data Science", "Business"].map((interest) => (
                      <Badge
                        key={interest}
                        variant={interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all"
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Objectif d'apprentissage</Label>
                  <Textarea
                    id="goal"
                    placeholder="Quel est votre objectif principal?"
                    rows={3}
                    defaultValue="Devenir développeur web full-stack et créer mes propres projets."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowPasswordDialog(true)}>
                  Changer le mot de passe
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => setShowDeleteDialog(true)}>
                  Supprimer mon compte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {showPasswordDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPasswordDialog(false)}>
            <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Ancien mot de passe</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowPasswordDialog(false)}>
                    Annuler
                  </Button>
                  <Button className="flex-1" onClick={handleChangePassword}>
                    Confirmer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteDialog(false)}>
            <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle className="text-destructive">Supprimer mon compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowDeleteDialog(false)}>
                    Annuler
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleDeleteAccount}>
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

export default Profile;
