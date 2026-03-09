using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Commands;

public record AddMemberCommand(
    Guid PropertyId,
    string Email,
    UserRole Role,
    string? ApartmentNumber) : IRequest<Guid>;

public class AddMemberCommandValidator : AbstractValidator<AddMemberCommand>
{
    public AddMemberCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Role).IsInEnum()
            .NotEqual(UserRole.SysAdmin).WithMessage("Cannot assign SysAdmin role via this endpoint.");
        RuleFor(x => x.ApartmentNumber).MaximumLength(20).When(x => x.ApartmentNumber is not null);
    }
}

public class AddMemberCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<AddMemberCommand, Guid>
{
    public async Task<Guid> Handle(AddMemberCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken)
            ?? throw new NotFoundException("User", request.Email);

        var propertyExists = await db.Properties
            .AnyAsync(p => p.Id == request.PropertyId, cancellationToken);

        if (!propertyExists)
            throw new NotFoundException(nameof(Domain.Entities.Property), request.PropertyId);

        var existing = await db.UserComplexMemberships
            .FirstOrDefaultAsync(m => m.UserId == user.Id && m.PropertyId == request.PropertyId, cancellationToken);

        if (existing is not null)
        {
            // Update role/apartment if already a member
            existing.Role = request.Role;
            existing.ApartmentNumber = request.ApartmentNumber;
        }
        else
        {
            db.UserComplexMemberships.Add(new UserComplexMembership
            {
                UserId = user.Id,
                PropertyId = request.PropertyId,
                Role = request.Role,
                ApartmentNumber = request.ApartmentNumber,
            });
        }

        await db.SaveChangesAsync(cancellationToken);
        return user.Id;
    }
}
