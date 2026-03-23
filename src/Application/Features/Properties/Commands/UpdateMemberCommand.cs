using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Commands;

public record UpdateMemberCommand(
    Guid PropertyId,
    Guid UserId,
    string? ApartmentNumber,
    UserRole Role,
    bool IsActive) : IRequest;

public class UpdateMemberCommandValidator : AbstractValidator<UpdateMemberCommand>
{
    public UpdateMemberCommandValidator()
    {
        RuleFor(x => x.Role).IsInEnum()
            .NotEqual(UserRole.SysAdmin).WithMessage("Cannot assign SysAdmin role via this endpoint.");
        RuleFor(x => x.ApartmentNumber).MaximumLength(20).When(x => x.ApartmentNumber is not null);
    }
}

public class UpdateMemberCommandHandler(
    IAppDbContext db,
    ICurrentUserService currentUser,
    PropertyAuthorizationService auth) : IRequestHandler<UpdateMemberCommand>
{
    public async Task Handle(UpdateMemberCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var membership = await db.UserComplexMemberships
            .FirstOrDefaultAsync(m => m.UserId == request.UserId && m.PropertyId == request.PropertyId, cancellationToken)
            ?? throw new NotFoundException("Membership", $"{request.UserId} in property {request.PropertyId}");

        // Prevent an admin from disabling or demoting themselves
        if (request.UserId == currentUser.UserId && (!request.IsActive || request.Role < UserRole.ComplexAdmin))
            throw new InvalidOperationException("You cannot disable or demote your own account.");

        membership.ApartmentNumber = request.ApartmentNumber;
        membership.Role = request.Role;
        membership.IsActive = request.IsActive;
        membership.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
    }
}
