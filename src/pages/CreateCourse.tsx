import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, X, Video, GripVertical } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { courseApi, Category, fileApi } from "@/services/api";

interface VideoModule {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
}

const CreateCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [modules, setModules] = useState<VideoModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  useEffect(() => {
    const init = async () => {
      const cats = await loadCategories();
      if (isEditMode && cats) {
        await loadCourse(cats);
      }
    };
    init();
  }, [id]);
  
  const loadCategories = async () => {
    try {
      const data = await courseApi.getAllCategories();
      setCategories(data);
      return data;
    } catch (error) {
      toast.error("Erreur lors du chargement des catégories");
      return null;
    }
  };
  
  const loadCourse = async (cats: Category[]) => {
    const userId = localStorage.getItem("userId");
    if (!userId || !id) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/courses/${id}/detail?userId=${userId}`);
      const data = await response.json();
      
      setTitle(data.title);
      setDescription(data.description);
      setThumbnailUrl(data.thumbnail);
      setSelectedCategory(cats.find(c => c.name === data.category)?.id.toString() || "");
      setSelectedLevel(data.level);
      
      const loadedModules = data.modules.flatMap((mod: any) => 
        mod.lessons.map((lesson: any) => ({
          id: lesson.id.toString(),
          title: lesson.title,
          duration: lesson.duration,
          videoUrl: lesson.videoUrl
        }))
      );
      setModules(loadedModules);
    } catch (error) {
      toast.error("Erreur lors du chargement du cours");
    }
  };

  const addModule = () => {
    const newModule: VideoModule = {
      id: Date.now().toString(),
      title: "",
      duration: "",
      videoUrl: ""
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const updateModule = (id: string, field: keyof VideoModule, value: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!selectedCategory || !selectedLevel) {
      toast.error("Veuillez sélectionner une catégorie et un niveau");
      setIsLoading(false);
      return;
    }
    
    if (modules.length === 0) {
      toast.error("Veuillez ajouter au moins un module");
      setIsLoading(false);
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const instructorId = localStorage.getItem("userId");
    
    if (!instructorId) {
      toast.error("Vous devez être connecté");
      setIsLoading(false);
      return;
    }
    
    try {
      const courseData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        categoryId: parseInt(selectedCategory),
        level: selectedLevel,
        thumbnail: formData.get('thumbnail') as string,
        modules: modules.map(m => ({
          title: m.title,
          duration: m.duration,
          videoUrl: m.videoUrl,
        })),
      };
      
      if (isEditMode && id) {
        await courseApi.updateCourse(parseInt(id), courseData, parseInt(instructorId));
        toast.success("Cours modifié avec succès!");
      } else {
        await courseApi.createCourse(courseData, parseInt(instructorId));
        toast.success("Cours créé avec succès!");
      }
      
      navigate("/teacher/courses");
    } catch (error: any) {
      toast.error(error.message || (isEditMode ? "Erreur lors de la modification" : "Erreur lors de la création du cours"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{isEditMode ? "Modifier le cours" : "Créer un nouveau cours"}</h1>
          <p className="text-muted-foreground">{isEditMode ? "Modifiez les informations et ajoutez des vidéos" : "Remplissez les informations et ajoutez vos vidéos"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Détails de base de votre cours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du cours</Label>
                <Input 
                  id="title"
                  name="title"
                  placeholder="Ex: Introduction à React.js"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  placeholder="Décrivez votre cours..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="" disabled>Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Niveau</Label>
                  <select
                    id="level"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="" disabled>Sélectionner un niveau</option>
                    <option value="DEBUTANT">Débutant</option>
                    <option value="INTERMEDIAIRE">Intermédiaire</option>
                    <option value="AVANCE">Avancé</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Image de couverture</Label>
                <div className="flex gap-2">
                  <Input 
                    id="thumbnail"
                    name="thumbnail"
                    type="url"
                    placeholder="URL de l'image"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    required
                  />
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploading(true);
                          try {
                            const result = await fileApi.uploadFile(file);
                            setThumbnailUrl(`http://localhost:8080${result.url}`);
                            toast.success("Image uploadée");
                          } catch (error) {
                            toast.error("Erreur lors de l'upload");
                          } finally {
                            setUploading(false);
                          }
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" disabled={uploading}>
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules vidéo */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Modules vidéo</CardTitle>
                  <CardDescription>Ajoutez les vidéos de votre cours</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addModule} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un module
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {modules.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Aucun module ajouté</p>
                  <Button type="button" variant="outline" onClick={addModule} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter le premier module
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <div key={module.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 pt-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                          <span className="font-semibold text-muted-foreground">#{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`module-title-${module.id}`}>Titre du module</Label>
                            <Input 
                              id={`module-title-${module.id}`}
                              placeholder="Ex: Introduction aux composants"
                              value={module.title}
                              onChange={(e) => updateModule(module.id, "title", e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor={`module-duration-${module.id}`}>Durée</Label>
                              <Input 
                                id={`module-duration-${module.id}`}
                                placeholder="Ex: 15:30"
                                value={module.duration}
                                onChange={(e) => updateModule(module.id, "duration", e.target.value)}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`module-video-${module.id}`}>Vidéo</Label>
                              <div className="flex gap-2">
                                <Input 
                                  id={`module-video-${module.id}`}
                                  type="url"
                                  placeholder="URL de la vidéo"
                                  value={module.videoUrl}
                                  onChange={(e) => updateModule(module.id, "videoUrl", e.target.value)}
                                  required
                                />
                                <div className="relative">
                                  <Input
                                    type="file"
                                    accept="video/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setUploading(true);
                                        try {
                                          const result = await fileApi.uploadFile(file);
                                          updateModule(module.id, "videoUrl", `http://localhost:8080${result.url}`);
                                          toast.success("Vidéo uploadée");
                                        } catch (error) {
                                          toast.error("Erreur lors de l'upload");
                                        } finally {
                                          setUploading(false);
                                        }
                                      }
                                    }}
                                  />
                                  <Button type="button" variant="outline" size="icon" disabled={uploading}>
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeModule(module.id)}
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
            <Button type="submit" disabled={isLoading} variant="hero">
              {isLoading ? (isEditMode ? "Modification..." : "Création...") : (isEditMode ? "Modifier le cours" : "Créer le cours")}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateCourse;
