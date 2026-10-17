# ---- Stage 1: Build với Gradle ----
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon --quiet

COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test --quiet

# ---- Stage 2: Runtime với JRE nhẹ, không root ----
FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup
WORKDIR /app

COPY --from=builder /app/build/libs/app.jar app.jar

ENV APP_VERSION=1.0.0 \
    JAVA_OPTS="-Xms128m -Xmx256m"
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/api/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
