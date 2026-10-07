using Application.Common.Authorization;
using Application.Common.Bookings;
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
    bool IsActive) : IRequest<int>;

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
    PropertyAuthorizationService auth) : IRequestHandler<UpdateMemberCommand, int>
{
    public async Task<int> Handle(UpdateMemberCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);
        await auth.RequireCanManageMemberAsync(request.PropertyId, request.UserId, cancellationToken);
        await auth.RequireCanGrantRoleAsync(request.PropertyId, request.Role, cancellationToken);

        var membership = await db.UserComplexMemberships
            .FirstOrDefaultAsync(m => m.UserId == request.UserId && m.PropertyId == request.PropertyId, cancellationToken)
            ?? throw new NotFoundException("Membership", $"{request.UserId} in property {request.PropertyId}");

        // Prevent an admin from disabling or demoting themselves
        if (request.UserId == currentUser.UserId && (!request.IsActive || request.Role < UserRole.ComplexAdmin))
            throw new ConflictException("Du kan ikke deaktivere eller nedgradere din egen konto.", ErrorCodes.CannotDemoteSelf);

        // Don't let the property lose its last active admin through demotion/deactivation
        var remainsAdmin = request.IsActive && request.Role >= UserRole.ComplexAdmin;
        if (membership.Role >= UserRole.ComplexAdmin && !remainsAdmin)
            await auth.RequireNotLastAdminAsync(request.PropertyId, request.UserId, cancellationToken);

        // A deactivated member can no longer see or cancel their bookings, so free the slots.
        var cancelled = membership.IsActive && !request.IsActive
            ? await db.Bookings
                .Where(b => b.UserId == request.UserId && b.LaundryRoom.PropertyId == request.PropertyId)
                .CancelUpcomingByAdminAsync(cancellationToken)
            : 0;

        membership.ApartmentNumber = request.ApartmentNumber;
        membership.Role = request.Role;
        membership.IsActive = request.IsActive;
        membership.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);

        return cancelled;
    }
}
