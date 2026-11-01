# Production Runtime Image for FoodieHut Spring Boot Backend
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Run as non-root user for security
RUN groupadd -r foodiehut && useradd -r -g foodiehut foodiehut
USER foodiehut

COPY target/foodiehut-backend-1.0.0.jar app.jar

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
