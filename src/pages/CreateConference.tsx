import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CreateConference = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const teacherId = localStorage.getItem("userId");
    
    try {
      const response = await fetch(`http://localhost:8080/api/conferences?teacherId=${teacherId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          scheduledAt: formData.get('scheduledAt'),
          duration: parseInt(formData.get('duration') as string),
        }),
      });
      
      const conference = await response.json();
      toast.success("Visioconférence créée avec succès!");
      navigate(`/teacher/conferences`);
    } catch (error) {
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Créer une visioconférence</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" name="title" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Date et heure</Label>
                <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Input id="duration" name="duration" type="number" min="15" defaultValue="60" required />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création..." : "Créer la visioconférence"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateConference;
