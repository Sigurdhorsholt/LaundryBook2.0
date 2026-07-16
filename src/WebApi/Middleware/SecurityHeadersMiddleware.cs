namespace WebApi.Middleware;

/// <summary>
/// Adds hardening response headers to every response. This is a JSON API (the SPA is a separate
/// origin), so the CSP locks everything down - no HTML/assets are served from here.
/// </summary>
public class SecurityHeadersMiddleware(RequestDelegate next, IWebHostEnvironment env)
{
    public Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        headers["X-Content-Type-Options"] = "nosniff";
        headers["X-Frame-Options"] = "DENY";
        headers["Referrer-Policy"] = "no-referrer";
        headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

        // Only over HTTPS in real environments; localhost dev runs on http.
        if (!env.IsDevelopment())
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";

        return next(context);
    }
}
