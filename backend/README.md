# CourseFlow Backend

## Prérequis

1. Java 17+
2. Maven
3. PostgreSQL

## Configuration PostgreSQL

Créez la base de données :
```sql
CREATE DATABASE courseflow;
```

Modifiez `application.properties` si nécessaire :
- URL: `jdbc:postgresql://localhost:5432/courseflow`
- Username: `postgres`
- Password: `postgres`

## Démarrage

```bash
cd backend
mvn spring-boot:run
```

L'API sera disponible sur http://localhost:8080

## Endpoints disponibles

### Authentification
- POST /api/auth/login - Connexion
- POST /api/auth/register - Inscription
