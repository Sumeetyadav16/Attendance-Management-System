# Use Java 21
FROM eclipse-temurin:21-jdk-alpine

# Set working directory
WORKDIR /app

# Copy Maven files first (for dependency caching)
COPY pom.xml .
COPY src ./src

# Install Maven and build
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests

# Run the jar
EXPOSE 8080

CMD ["java", "-jar", "target/attendance-backend-1.0.0.jar"]