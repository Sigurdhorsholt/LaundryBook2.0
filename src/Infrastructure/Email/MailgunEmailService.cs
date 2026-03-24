using System.Net.Http.Headers;
using System.Text;
using Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Email;

public class MailgunEmailService(
    HttpClient httpClient,
    IConfiguration configuration,
    ILogger<MailgunEmailService> logger) : IEmailService
{
    public async Task SendPasswordSetupEmailAsync(string toEmail, string passwordSetupLink, CancellationToken cancellationToken = default)
    {
        var apiKey = configuration["Mailgun:ApiKey"]!;
        var domain = configuration["Mailgun:Domain"]!;
        var senderEmail = configuration["Mailgun:SenderEmail"] ?? $"noreply@{domain}";
        var senderName = configuration["Mailgun:SenderName"] ?? "LaundryBook";

        var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"api:{apiKey}"));
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);

        var plainText = $"""
            Du er inviteret til at bruge LaundryBook — din ejendoms vaskeribookingsystem.

            Klik på linket nedenfor for at oprette din adgangskode:
            {passwordSetupLink}

            Linket udløber om 24 timer.
            Har du ikke forventet denne e-mail, kan du se bort fra den.
            """;

        var html = $"""
            <p>Hej,</p>
            <p>Du er inviteret til at bruge <strong>LaundryBook</strong> — din ejendoms vaskeribookingsystem.</p>
            <p><a href="{passwordSetupLink}" style="display:inline-block;padding:10px 20px;background:#1565c0;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Opret din adgangskode</a></p>
            <p style="color:#888;font-size:0.9em;">Linket udløber om 24 timer. Har du ikke forventet denne e-mail, kan du se bort fra den.</p>
            """;

        var form = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("from", $"{senderName} <{senderEmail}>"),
            new KeyValuePair<string, string>("to", toEmail),
            new KeyValuePair<string, string>("subject", "Du er inviteret til LaundryBook"),
            new KeyValuePair<string, string>("text", plainText),
            new KeyValuePair<string, string>("html", html),
        ]);

        var baseUrl = configuration["Mailgun:BaseUrl"] ?? "https://api.eu.mailgun.net";
        var response = await httpClient.PostAsync(
            $"{baseUrl}/v3/{domain}/messages",
            form,
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("Mailgun returned {StatusCode}: {Body}", response.StatusCode, body);
            throw new InvalidOperationException($"Failed to send invite email (HTTP {(int)response.StatusCode}).");
        }
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default)
    {
        var apiKey = configuration["Mailgun:ApiKey"]!;
        var domain = configuration["Mailgun:Domain"]!;
        var senderEmail = configuration["Mailgun:SenderEmail"] ?? $"noreply@{domain}";
        var senderName = configuration["Mailgun:SenderName"] ?? "LaundryBook";

        var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"api:{apiKey}"));
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);

        var plainText = $"""
            Du har bedt om at nulstille din adgangskode til LaundryBook.

            Klik på linket nedenfor for at vælge en ny adgangskode:
            {resetLink}

            Linket udløber om 1 time.
            Har du ikke bedt om dette, kan du se bort fra denne e-mail — din adgangskode er ikke ændret.
            """;

        var html = $"""
            <p>Hej,</p>
            <p>Du har bedt om at nulstille din adgangskode til <strong>LaundryBook</strong>.</p>
            <p><a href="{resetLink}" style="display:inline-block;padding:10px 20px;background:#1565c0;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Nulstil adgangskode</a></p>
            <p style="color:#888;font-size:0.9em;">Linket udløber om 1 time. Har du ikke bedt om dette, kan du se bort fra denne e-mail — din adgangskode er ikke ændret.</p>
            """;

        var form = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("from", $"{senderName} <{senderEmail}>"),
            new KeyValuePair<string, string>("to", toEmail),
            new KeyValuePair<string, string>("subject", "Nulstil din adgangskode"),
            new KeyValuePair<string, string>("text", plainText),
            new KeyValuePair<string, string>("html", html),
        ]);

        var baseUrl = configuration["Mailgun:BaseUrl"] ?? "https://api.eu.mailgun.net";
        var response = await httpClient.PostAsync(
            $"{baseUrl}/v3/{domain}/messages",
            form,
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("Mailgun returned {StatusCode}: {Body}", response.StatusCode, body);
            throw new InvalidOperationException($"Failed to send password reset email (HTTP {(int)response.StatusCode}).");
        }
    }
}
