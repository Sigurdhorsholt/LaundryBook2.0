using Application.Common.Interfaces;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Infrastructure.Auth;
using Infrastructure.Email;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Npgsql;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        var provider = configuration["DatabaseProvider"] ?? "Sqlite";

        services.AddDbContext<AppDbContext>(options =>
        {
            if (provider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase))
                options.UseNpgsql(ToNpgsqlConnectionString(connectionString),
                    b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName));
            else
                options.UseSqlite(connectionString,
                    b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName));
        });

        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        // Auth services
        services.AddHttpContextAccessor();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // IDP — use FirebaseIdentityProvider when Firebase:ProjectId is configured,
        // otherwise fall back to DevIdentityProvider (useful for local dev without Firebase).
        var firebaseProjectId = configuration["Firebase:ProjectId"];
        if (!string.IsNullOrEmpty(firebaseProjectId))
        {
            InitializeFirebase(configuration, firebaseProjectId);
            services.AddScoped<IIdentityProvider, FirebaseIdentityProvider>();
        }
        else
        {
            services.AddScoped<IIdentityProvider, DevIdentityProvider>();
        }

        // Email service — use Mailgun when an API key is configured, otherwise log to console (dev)
        if (!string.IsNullOrEmpty(configuration["Mailgun:ApiKey"]))
            services.AddHttpClient<IEmailService, MailgunEmailService>();
        else
            services.AddScoped<IEmailService, DevEmailService>();

        return services;
    }

    private static void InitializeFirebase(IConfiguration configuration, string projectId)
    {
        if (FirebaseApp.DefaultInstance != null)
            return;

        GoogleCredential credential;

        // Priority 1: inline JSON from config or env var (recommended for Render/Railway)
        var serviceAccountJson = configuration["Firebase:ServiceAccountJson"]
            ?? Environment.GetEnvironmentVariable("FIREBASE_SERVICE_ACCOUNT_JSON");

        if (!string.IsNullOrEmpty(serviceAccountJson))
        {
            credential = GoogleCredential.FromJson(serviceAccountJson);
        }
        // Priority 2: path to a service account JSON file (local dev)
        else
        {
            var serviceAccountPath = configuration["Firebase:ServiceAccountPath"];
            if (!string.IsNullOrEmpty(serviceAccountPath) && File.Exists(serviceAccountPath))
                credential = GoogleCredential.FromFile(serviceAccountPath);
            else
                // Priority 3: Application Default Credentials (GCP/Cloud Run, GOOGLE_APPLICATION_CREDENTIALS)
                credential = GoogleCredential.GetApplicationDefault();
        }

        FirebaseApp.Create(new AppOptions
        {
            Credential = credential,
            ProjectId = projectId,
        });
    }

    /// <summary>
    /// Render (and many PaaS providers) supply the connection string as a URI:
    ///   postgresql://user:password@host:port/database
    /// Npgsql expects key-value format. This converts if needed; passes through otherwise.
    /// </summary>
    private static string ToNpgsqlConnectionString(string connectionString)
    {
        if (!connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
            return connectionString; // already key-value format

        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':', 2);

        return new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.TrimStart('/'),
            Username = userInfo.Length > 0 ? userInfo[0] : string.Empty,
            Password = userInfo.Length > 1 ? userInfo[1] : string.Empty,
            SslMode = SslMode.Require,
            TrustServerCertificate = true,
        }.ConnectionString;
    }
}
