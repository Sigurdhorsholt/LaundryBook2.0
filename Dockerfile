# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution + csproj files first — lets Docker cache the restore layer
COPY LaundryBook2.0.sln ./
COPY src/Domain/Domain.csproj             src/Domain/
COPY src/Application/Application.csproj  src/Application/
COPY src/Infrastructure/Infrastructure.csproj src/Infrastructure/
COPY src/WebApi/WebApi.csproj             src/WebApi/

RUN dotnet restore

# Copy source and publish
COPY src/ src/
RUN dotnet publish src/WebApi/WebApi.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Render (and most PaaS) routes external traffic to $PORT
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "WebApi.dll"]
