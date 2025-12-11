# syntax=docker/dockerfile:1
FROM public.ecr.aws/amazoncorretto/amazoncorretto:21 AS build
WORKDIR /workspace
COPY . .
RUN ./mvnw -q -e -DskipTests package || mvn -q -DskipTests package

FROM public.ecr.aws/amazoncorretto/amazoncorretto:21
ENV JAVA_OPTS=""
WORKDIR /app
COPY --from=build /workspace/target/tenant-management-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]


