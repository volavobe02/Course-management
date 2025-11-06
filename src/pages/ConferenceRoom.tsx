import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Users } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ConferenceRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conference, setConference] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [participants, setParticipants] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadConference();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [id]);

  const loadConference = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/conferences/${id}`);
      const data = await response.json();
      setConference(data);
      
      const userId = localStorage.getItem("userId");
      setIsHost(data.teacher.id.toString() === userId);
      
      if (data.teacher.id.toString() === userId) {
        await fetch(`http://localhost:8080/api/conferences/${id}/status?status=LIVE`, {
          method: 'PUT'
        });
      }
    } catch (error) {
      toast.error("Erreur lors du chargement");
    }
  };

  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setIsMicOn(true);
        toast.success("Microphone activé");
      } catch (error) {
        toast.error("Impossible d'accéder au microphone");
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(track => track.stop());
      }
      setIsMicOn(false);
      toast.success("Microphone désactivé");
    }
  };

  const toggleVideo = async () => {
    if (!isVideoOn && isHost) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsVideoOn(true);
        toast.success("Caméra activée");
      } catch (error) {
        toast.error("Impossible d'accéder à la caméra");
      }
    } else if (isVideoOn) {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsVideoOn(false);
      toast.success("Caméra désactivée");
    }
  };

  const leaveConference = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (isHost) {
      await fetch(`http://localhost:8080/api/conferences/${id}/status?status=ENDED`, {
        method: 'PUT'
      });
    }
    
    navigate(isHost ? '/teacher/courses' : '/conferences');
  };

  if (!conference) return <div className="min-h-screen bg-background"><Navbar /><div className="container px-4 py-8">Chargement...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{conference.title}</h1>
            <p className="text-muted-foreground">{conference.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isHost ? "default" : "secondary"}>
              {isHost ? "Hôte" : "Participant"}
            </Badge>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{participants} participant{participants > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <Card className="overflow-hidden bg-black aspect-video">
            {isVideoOn && isHost ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <span className="text-4xl font-bold text-primary">
                      {conference.teacher.firstName[0]}{conference.teacher.lastName[0]}
                    </span>
                  </div>
                  <div className="text-white">
                    <p className="font-semibold">{conference.teacher.firstName} {conference.teacher.lastName}</p>
                    <p className="text-sm text-gray-400">{isHost ? "Vous" : "Hôte"}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Contrôles</h3>
              <div className="space-y-3">
                <Button
                  variant={isMicOn ? "default" : "outline"}
                  className="w-full justify-start gap-2"
                  onClick={toggleMic}
                >
                  {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  {isMicOn ? "Désactiver le micro" : "Activer le micro"}
                </Button>

                {isHost && (
                  <Button
                    variant={isVideoOn ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                    onClick={toggleVideo}
                  >
                    {isVideoOn ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    {isVideoOn ? "Désactiver la caméra" : "Activer la caméra"}
                  </Button>
                )}

                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={leaveConference}
                >
                  <PhoneOff className="h-4 w-4" />
                  Quitter la conférence
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Informations</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Durée prévue:</span>
                  <p className="font-medium">{conference.duration} minutes</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Statut:</span>
                  <p className="font-medium">{conference.status}</p>
                </div>
              </div>
            </Card>

            {!isHost && (
              <Card className="p-4 bg-muted">
                <p className="text-sm text-muted-foreground">
                  💡 En tant que participant, vous pouvez activer votre microphone pour poser des questions. 
                  Seul l'hôte peut activer sa caméra.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConferenceRoom;
