using Application.Common.Authorization;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.Properties.Commands;

public record CreatePropertyCommand(string Name, string Address) : IRequest<Guid>;

public class CreatePropertyCommandValidator : AbstractValidator<CreatePropertyCommand>
{
    public CreatePropertyCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
    }
}

public class CreatePropertyCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<CreatePropertyCommand, Guid>
{
    public async Task<Guid> Handle(CreatePropertyCommand request, CancellationToken cancellationToken)
    {
        // Only SysAdmin can create properties
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new Application.Common.Exceptions.ForbiddenException();

        var property = new Property
        {
            Name = request.Name,
            Address = request.Address,
            Settings = new ComplexSettings
            {
                BookingMode = BookingMode.BookSpecificMachine,
                CancellationWindowMinutes = 60,
                MaxConcurrentBookingsPerUser = 2,
            }
        };

        db.Properties.Add(property);
        await db.SaveChangesAsync(cancellationToken);

        return property.Id;
    }
}
