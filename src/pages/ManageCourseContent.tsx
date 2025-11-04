import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, X, FileText, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { fileApi } from "@/services/api";

const ManageCourseContent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [objectives, setObjectives] = useState<string[]>([""]);
  const [resources, setResources] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/courses/${id}/content`);
      const data = await response.json();
      setCourse(data);
      setObjectives(data.objectives || [""]);
      setResources(data.resources || []);
    } catch (error) {
      toast.error("Erreur lors du chargement");
    }
  };

  const addObjective = () => setObjectives([...objectives, ""]);
  const removeObjective = (index: number) => setObjectives(objectives.filter((_, i) => i !== index));
  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const saveObjectives = async () => {
    try {
      await fetch(`http://localhost:8080/api/courses/${id}/objectives`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectives: objectives.filter(o => o.trim()) }),
      });
      toast.success("Objectifs sauvegardés");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const uploadResource = async (file: File) => {
    setUploading(true);
    try {
      const result = await fileApi.uploadFile(file);
      await fetch(`http://localhost:8080/api/courses/${id}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          fileUrl: `http://localhost:8080${result.url}`,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        }),
      });
      toast.success("Ressource ajoutée");
      loadCourse();
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const deleteResource = async (resourceId: number) => {
    try {
      await fetch(`http://localhost:8080/api/courses/${id}/resources/${resourceId}`, {
        method: 'DELETE',
      });
      toast.success("Ressource supprimée");
      loadCourse();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gérer le contenu du cours</h1>
          <p className="text-muted-foreground">{course?.title}</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="resources">Ressources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Objectifs d'apprentissage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {objectives.map((obj, index) => (
                  <div key={index} className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-2" />
                    <Input
                      value={obj}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      placeholder="Ex: Créer des sites web responsives"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeObjective(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={addObjective} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter un objectif
                  </Button>
                  <Button onClick={saveObjectives}>Sauvegarder</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ressources du cours</CardTitle>
                  <div className="relative">
                    <Input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadResource(file);
                      }}
                    />
                    <Button variant="outline" size="sm" disabled={uploading} className="gap-2">
                      <Upload className="h-4 w-4" />
                      Ajouter une ressource
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {resources.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune ressource</p>
                ) : (
                  resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{resource.name}</p>
                          <p className="text-sm text-muted-foreground">{resource.fileSize}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteResource(resource.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 justify-end mt-6">
          <Button variant="outline" onClick={() => navigate("/teacher/courses")}>
            Retour
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ManageCourseContent;
