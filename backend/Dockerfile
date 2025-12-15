# syntax=docker/dockerfile:1
FROM amazoncorretto:21-alpine AS build
WORKDIR /workspace
COPY . .
RUN apk add --no-cache tar gzip
RUN ./mvnw -q -e -DskipTests package || mvn -q -DskipTests package

FROM amazoncorretto:21-alpine
ENV JAVA_OPTS=""
WORKDIR /app
COPY --from=build /workspace/target/tenant-management-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]


