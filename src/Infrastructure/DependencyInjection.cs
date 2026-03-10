using Application.Common.Interfaces;
using Infrastructure.Auth;
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

        // IDP — swap this registration to change identity provider
        if (environment.IsDevelopment())
            services.AddScoped<IIdentityProvider, DevIdentityProvider>();
        else
            // TODO: register FirebaseIdentityProvider (or other) for production
            services.AddScoped<IIdentityProvider, DevIdentityProvider>();

        return services;
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
            TrustServerCertificate = true, // Render uses self-signed certs internally
        }.ConnectionString;
    }
}
