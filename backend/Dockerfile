# --- Stage 1: Build ---
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY GovernmentCitizenServices.Api.csproj ./
RUN dotnet restore "GovernmentCitizenServices.Api.csproj"

# Copy full source and publish
COPY . ./
RUN dotnet publish "GovernmentCitizenServices.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# --- Stage 2: Production Runner ---
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_HTTP_PORTS=5000
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

# Create Uploads Directory
RUN mkdir -p /app/uploads

EXPOSE 5000

ENTRYPOINT ["dotnet", "GovernmentCitizenServices.Api.dll"]
