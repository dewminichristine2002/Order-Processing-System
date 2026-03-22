# ── Runtime image ────────────────────────────────────────────────────────────
# Use a minimal JRE (not JDK) image to reduce attack surface.
# eclipse-temurin:21-jre is a well-maintained, regularly patched base image.
FROM eclipse-temurin:21-jre

# ── Security: run as a non-root user ─────────────────────────────────────────
# Principle of least privilege: the JVM process runs as 'appuser' (UID 1000)
# which has no shell, no home directory, and cannot escalate privileges.
RUN groupadd --system appgroup && \
    useradd  --system --no-create-home --gid appgroup appuser

WORKDIR /app

# Copy JAR owned by root so 'appuser' can read/execute it but not modify it
COPY --chown=root:appgroup target/payment-service-0.0.1-SNAPSHOT.jar payment-service.jar

# Switch to unprivileged user before starting the process
USER appuser

EXPOSE 8082

# Use exec-form (not shell-form) so signals (SIGTERM) are delivered to the JVM
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "payment-service.jar"]