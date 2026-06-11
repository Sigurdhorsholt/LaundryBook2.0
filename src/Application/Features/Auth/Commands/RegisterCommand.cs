using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Commands;

public record RegisterCommand(
    string IdToken,
    string FirstName,
    string LastName,
    string PropertyName,
    string PropertyAddress) : IRequest<RegisterResult>;

public record RegisterResult(string JwtToken, Guid UserId, Guid PropertyId);

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.IdToken).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PropertyName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.PropertyAddress).NotEmpty().MaximumLength(500);
    }
}

public class RegisterCommandHandler(
    IAppDbContext db,
    IIdentityProvider identityProvider,
    IJwtService jwtService) : IRequestHandler<RegisterCommand, RegisterResult>
{
    public async Task<RegisterResult> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var external = await identityProvider.VerifyTokenAsync(request.IdToken, cancellationToken);

        var user = await db.Users
            .FirstOrDefaultAsync(u => u.ExternalId == external.ExternalId, cancellationToken);

        if (user is null)
        {
            user = new User
            {
                ExternalId = external.ExternalId,
                Email = external.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
            };
            db.Users.Add(user);
        }
        else
        {
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
        }

        var property = new Property
        {
            Name = request.PropertyName,
            Address = request.PropertyAddress,
            IsActive = false,
            Settings = new ComplexSettings
            {
                BookingMode = BookingMode.BookSpecificMachine,
                CancellationWindowMinutes = 60,
                MaxConcurrentBookingsPerUser = 2,
                BookingLookaheadDays = 14,
                BookingVisibility = BookingVisibility.ApartmentOnly,
            },
        };
        db.Properties.Add(property);

        db.UserComplexMemberships.Add(new UserComplexMembership
        {
            UserId = user.Id,
            PropertyId = property.Id,
            Role = UserRole.ComplexAdmin,
        });

        await db.SaveChangesAsync(cancellationToken);

        var token = jwtService.GenerateToken(user);
        return new RegisterResult(token, user.Id, property.Id);
    }
}
