using System.Net.Http.Headers;
using System.Text;
using Application.Common.Interfaces;
using Infrastructure.Email.Templates;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Email;

public class MailgunEmailService(
    HttpClient httpClient,
    IConfiguration configuration,
    ILogger<MailgunEmailService> logger) : IEmailService
{
    public async Task SendPasswordSetupEmailAsync(
        string toEmail,
        string passwordSetupLink,
        string propertyName,
        string propertyAddress,
        string adminName,
        CancellationToken cancellationToken = default)
    {
        var (apiKey, domain, senderEmail, senderName) = ReadMailgunConfig();
        var landingPageUrl = configuration["App:BaseUrl"] ?? "https://app.laundrybook.com";

        Authorize(apiKey);

        var form = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("from", $"{senderName} <{senderEmail}>"),
            new KeyValuePair<string, string>("to", toEmail),
            new KeyValuePair<string, string>("subject", $"Du er inviteret til {propertyName} på LaundryBook"),
            new KeyValuePair<string, string>("text", InviteEmailTemplate.Text(propertyName, propertyAddress, adminName, passwordSetupLink, landingPageUrl)),
            new KeyValuePair<string, string>("html", InviteEmailTemplate.Html(propertyName, propertyAddress, adminName, passwordSetupLink, landingPageUrl)),
        ]);

        await SendAsync(domain, form, "invite email", cancellationToken);
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default)
    {
        var (apiKey, domain, senderEmail, senderName) = ReadMailgunConfig();
        var landingPageUrl = configuration["App:BaseUrl"] ?? "https://app.laundrybook.com";

        Authorize(apiKey);

        var form = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("from", $"{senderName} <{senderEmail}>"),
            new KeyValuePair<string, string>("to", toEmail),
            new KeyValuePair<string, string>("subject", "Nulstil din adgangskode til LaundryBook"),
            new KeyValuePair<string, string>("text", PasswordResetEmailTemplate.Text(resetLink, landingPageUrl)),
            new KeyValuePair<string, string>("html", PasswordResetEmailTemplate.Html(resetLink, landingPageUrl)),
        ]);

        await SendAsync(domain, form, "password reset email", cancellationToken);
    }

    private (string apiKey, string domain, string senderEmail, string senderName) ReadMailgunConfig()
    {
        var apiKey = configuration["Mailgun:ApiKey"]!;
        var domain = configuration["Mailgun:Domain"]!;
        var senderEmail = configuration["Mailgun:SenderEmail"] ?? $"noreply@{domain}";
        var senderName = configuration["Mailgun:SenderName"] ?? "LaundryBook";
        return (apiKey, domain, senderEmail, senderName);
    }

    private void Authorize(string apiKey)
    {
        var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"api:{apiKey}"));
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);
    }

    private async Task SendAsync(string domain, FormUrlEncodedContent form, string emailType, CancellationToken cancellationToken)
    {
        var baseUrl = configuration["Mailgun:BaseUrl"] ?? "https://api.eu.mailgun.net";
        var response = await httpClient.PostAsync($"{baseUrl}/v3/{domain}/messages", form, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("Mailgun returned {StatusCode} for {EmailType}: {Body}", response.StatusCode, emailType, body);
            throw new InvalidOperationException($"Failed to send {emailType} (HTTP {(int)response.StatusCode}).");
        }
    }
}
