package com.courseflow.config;

import com.courseflow.model.Category;
import com.courseflow.model.Course;
import com.courseflow.model.User;
import com.courseflow.repository.CategoryRepository;
import com.courseflow.repository.CourseRepository;
import com.courseflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    
    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            initCategories();
            initCourses();
        }
    }
    
    private void initCategories() {
        String[] categories = {"Développement", "Design", "Business", "Marketing", "Data Science"};
        for (String name : categories) {
            Category category = new Category();
            category.setName(name);
            categoryRepository.save(category);
        }
    }
    
    private void initCourses() {
        User teacher = createTeacher("Marie", "Dubois", "marie@example.com");
        User teacher2 = createTeacher("Pierre", "Martin", "pierre@example.com");
        User teacher3 = createTeacher("Sophie", "Laurent", "sophie@example.com");
        User teacher4 = createTeacher("Thomas", "Bernard", "thomas@example.com");
        User teacher5 = createTeacher("Lucas", "Moreau", "lucas@example.com");
        User teacher6 = createTeacher("Emma", "Rousseau", "emma@example.com");
        
        Category dev = categoryRepository.findById(1L).orElse(null);
        Category design = categoryRepository.findById(2L).orElse(null);
        Category business = categoryRepository.findById(3L).orElse(null);
        Category marketing = categoryRepository.findById(4L).orElse(null);
        Category datascience = categoryRepository.findById(5L).orElse(null);
        
        createCourse("Développement Web Complet - HTML, CSS, JavaScript", teacher, 
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
            "40h", Course.Level.DEBUTANT, dev);
            
        createCourse("Design UX/UI Moderne - Figma & Wireframing", teacher2,
            "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
            "25h", Course.Level.INTERMEDIAIRE, design);
            
        createCourse("Python pour la Data Science et Machine Learning", teacher3,
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
            "55h", Course.Level.AVANCE, datascience);
            
        createCourse("Marketing Digital - SEO, Social Media & Analytics", teacher4,
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
            "30h", Course.Level.DEBUTANT, marketing);
            
        createCourse("React & TypeScript - Applications Web Modernes", teacher5,
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
            "45h", Course.Level.INTERMEDIAIRE, dev);
            
        createCourse("Business Strategy & Leadership Excellence", teacher6,
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
            "20h", Course.Level.AVANCE, business);
    }
    
    private User createTeacher(String firstName, String lastName, String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            return userRepository.findByEmail(email).get();
        }
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword("password");
        user.setRole(User.Role.TEACHER);
        return userRepository.save(user);
    }
    
    private void createCourse(String title, User instructor, String thumbnail, 
                             String duration, Course.Level level, Category category) {
        Course course = new Course();
        course.setTitle(title);
        course.setDescription("Description du cours");
        course.setInstructor(instructor);
        course.setThumbnail(thumbnail);
        course.setRating(0.0);
        course.setStudentsCount(0);
        course.setDuration(duration);
        course.setLevel(level);
        course.setCategory(category);
        courseRepository.save(course);
    }
}
