import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, User, BookOpen, Plus, Moon, Sun, Video } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
    const theme = localStorage.getItem("theme");
    setIsDark(theme === "dark");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (userRole?.toLowerCase() === "teacher") {
        navigate(`/teacher/courses?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <nav className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to={userRole?.toLowerCase() === "teacher" ? "/teacher/courses" : "/dashboard"} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              LearnHub
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {userRole?.toLowerCase() === "teacher" ? (
              <>
                <Link to="/teacher/courses">
                  <Button variant="ghost" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Mes Cours
                  </Button>
                </Link>
                <Link to="/teacher/create-course">
                  <Button variant="ghost" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Créer un cours
                  </Button>
                </Link>
                <Link to="/teacher/create-conference">
                  <Button variant="ghost" className="gap-2">
                    <Video className="h-4 w-4" />
                    Créer une visio
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost">Explorer</Button>
                </Link>
                <Link to="/my-learning">
                  <Button variant="ghost">Mes Cours</Button>
                </Link>
                <Link to="/conferences">
                  <Button variant="ghost" className="gap-2">
                    <Video className="h-4 w-4" />
                    Visioconférences
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="hidden lg:flex relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un cours..."
              className="w-64 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                Mon Compte
                {userRole && (
                  <div className="text-xs text-muted-foreground font-normal">
                    {userRole.toLowerCase() === "teacher" ? "Professeur" : "Étudiant"}
                  </div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/profile">
                <DropdownMenuItem>Profil</DropdownMenuItem>
              </Link>
              {userRole?.toLowerCase() === "teacher" ? (
                <>
                  <Link to="/teacher/courses">
                    <DropdownMenuItem>Mes Cours</DropdownMenuItem>
                  </Link>
                  <Link to="/teacher/conferences">
                    <DropdownMenuItem>Mes Visioconférences</DropdownMenuItem>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/my-learning">
                    <DropdownMenuItem>Mes Cours</DropdownMenuItem>
                  </Link>
                  <Link to="/conferences">
                    <DropdownMenuItem>Visioconférences</DropdownMenuItem>
                  </Link>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Se déconnecter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};
