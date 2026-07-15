using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SysAdmin.Commands;

public enum TestEmailTemplate
{
    Invite = 0,
    PasswordReset = 1,
    AdminPasswordReset = 2,
}

public record SendTestEmailCommand(string ToEmail, TestEmailTemplate Template) : IRequest;

public class SendTestEmailCommandValidator : AbstractValidator<SendTestEmailCommand>
{
    public SendTestEmailCommandValidator()
    {
        RuleFor(x => x.ToEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.Template).IsInEnum();
    }
}

public class SendTestEmailCommandHandler(
    IAppDbContext db,
    IEmailService emailService,
    ICurrentUserService currentUser,
    PropertyAuthorizationService auth) : IRequestHandler<SendTestEmailCommand>
{
    private const string SampleLink = "https://laundrybook.dk/eksempel-link";
    private const string SampleProperty = "Testforening";
    private const string SampleAddress = "Testvej 1, 8000 Aarhus C";

    public async Task Handle(SendTestEmailCommand request, CancellationToken cancellationToken)
    {
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new ForbiddenException();

        var admin = await db.Users.FirstOrDefaultAsync(u => u.Id == currentUser.UserId, cancellationToken);
        var adminName = admin is not null ? $"{admin.FirstName} {admin.LastName}".Trim() : "Administrator";

        var toEmail = request.ToEmail.Trim();

        switch (request.Template)
        {
            case TestEmailTemplate.Invite:
                await emailService.SendPasswordSetupEmailAsync(
                    toEmail, SampleLink, SampleProperty, SampleAddress, adminName, cancellationToken);
                break;
            case TestEmailTemplate.PasswordReset:
                await emailService.SendPasswordResetEmailAsync(toEmail, SampleLink, cancellationToken);
                break;
            case TestEmailTemplate.AdminPasswordReset:
                await emailService.SendAdminPasswordResetEmailAsync(
                    toEmail, SampleLink, SampleProperty, adminName, cancellationToken);
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(request));
        }
    }
}
