using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.LaundryMachines.Queries;

public record GetLaundryMachinesQuery(Guid RoomId) : IRequest<List<LaundryMachineDto>>;

public record LaundryMachineDto(Guid Id, string Name, MachineType MachineType, bool IsActive);

public class GetLaundryMachinesQueryHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<GetLaundryMachinesQuery, List<LaundryMachineDto>>
{
    public async Task<List<LaundryMachineDto>> Handle(GetLaundryMachinesQuery request, CancellationToken cancellationToken)
    {
        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.Resident, cancellationToken);

        return await db.LaundryMachines
            .Where(m => m.LaundryRoomId == request.RoomId && m.IsActive)
            .Select(m => new LaundryMachineDto(m.Id, m.Name, m.MachineType, m.IsActive))
            .ToListAsync(cancellationToken);
    }
}
