using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SysAdmin.Commands;

public record AssignUserToPropertyCommand(
    Guid UserId,
    Guid PropertyId,
    UserRole Role,
    string? ApartmentNumber) : IRequest;

public class AssignUserToPropertyCommandValidator : AbstractValidator<AssignUserToPropertyCommand>
{
    public AssignUserToPropertyCommandValidator()
    {
        RuleFor(x => x.Role).IsInEnum()
            .NotEqual(UserRole.SysAdmin).WithMessage("Cannot assign SysAdmin role via this endpoint.");
        RuleFor(x => x.ApartmentNumber).MaximumLength(20).When(x => x.ApartmentNumber is not null);
    }
}

public class AssignUserToPropertyCommandHandler(IAppDbContext db, PropertyAuthorizationService auth)
    : IRequestHandler<AssignUserToPropertyCommand>
{
    public async Task Handle(AssignUserToPropertyCommand request, CancellationToken cancellationToken)
    {
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new ForbiddenException();

        var userExists = await db.Users.AnyAsync(u => u.Id == request.UserId, cancellationToken);
        if (!userExists) throw new NotFoundException(nameof(User), request.UserId);

        var propertyExists = await db.Properties.AnyAsync(p => p.Id == request.PropertyId, cancellationToken);
        if (!propertyExists) throw new NotFoundException(nameof(Property), request.PropertyId);

        var existing = await db.UserComplexMemberships
            .FirstOrDefaultAsync(m => m.UserId == request.UserId && m.PropertyId == request.PropertyId, cancellationToken);

        if (existing is not null)
        {
            existing.Role = request.Role;
            existing.ApartmentNumber = request.ApartmentNumber;
        }
        else
        {
            db.UserComplexMemberships.Add(new UserComplexMembership
            {
                UserId = request.UserId,
                PropertyId = request.PropertyId,
                Role = request.Role,
                ApartmentNumber = request.ApartmentNumber,
            });
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
