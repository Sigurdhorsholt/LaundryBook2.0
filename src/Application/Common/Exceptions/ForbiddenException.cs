namespace Application.Common.Exceptions;

// Every error the API returns on purpose carries a stable code. Clients translate the code;
// the message is only a Danish fallback for clients that don't know it yet.
public abstract class AppException(string message, string code, IReadOnlyDictionary<string, object>? parameters = null)
    : Exception(message)
{
    public string Code { get; } = code;
    public IReadOnlyDictionary<string, object>? Parameters { get; } = parameters;
}

public class ForbiddenException(string message = "Du har ikke adgang til at gøre dette.", string code = ErrorCodes.Forbidden)
    : AppException(message, code);

public class NotFoundException(string entity, object key)
    : AppException($"{entity} '{key}' was not found.", ErrorCodes.NotFound);

public class ConflictException(string message, string code, IReadOnlyDictionary<string, object>? parameters = null)
    : AppException(message, code, parameters);
