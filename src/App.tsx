import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import CourseDetail from "./pages/CourseDetail";
import MyLearning from "./pages/MyLearning";
import Profile from "./pages/Profile";
import TeacherCourses from "./pages/TeacherCourses";
import CreateCourse from "./pages/CreateCourse";
import CreateQuiz from "./pages/CreateQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import QuizResults from "./pages/QuizResults";
import CourseStudents from "./pages/CourseStudents";
import ManageCourseContent from "./pages/ManageCourseContent";
import Certificate from "./pages/Certificate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/my-learning" element={<MyLearning />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/teacher/courses" element={<TeacherCourses />} />
          <Route path="/teacher/create-course" element={<CreateCourse />} />
          <Route path="/teacher/edit-course/:id" element={<CreateCourse />} />
          <Route path="/teacher/create-quiz/:courseId" element={<CreateQuiz />} />
          <Route path="/teacher/course/:courseId/students" element={<CourseStudents />} />
          <Route path="/teacher/course/:id/content" element={<ManageCourseContent />} />
          <Route path="/quiz/:quizId" element={<TakeQuiz />} />
          <Route path="/quiz/:quizId/results" element={<QuizResults />} />
          <Route path="/certificate/:courseId" element={<Certificate />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
