namespace Application.Common.Exceptions;

public class ForbiddenException(string message = "You do not have permission to perform this action.")
    : Exception(message);

public class NotFoundException(string entity, object key)
    : Exception($"{entity} '{key}' was not found.");

public class ConflictException(string message)
    : Exception(message);
