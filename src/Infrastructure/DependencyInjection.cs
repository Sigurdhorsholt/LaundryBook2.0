using Application.Common.Interfaces;
using Infrastructure.Auth;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

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
}
