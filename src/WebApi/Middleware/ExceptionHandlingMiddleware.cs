using Application.Common.Exceptions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Sentry;
using System.Net;
using System.Text.Json;

namespace WebApi.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            await WriteJson(context, (int)HttpStatusCode.UnprocessableEntity, new
            {
                // Handlers throw ValidationException(message) without field errors; keep that message
                title = ex.Errors.Any() ? "Validation failed" : ex.Message,
                status = 422,
                code = ErrorCodes.ValidationFailed,
                errors = ex.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())
            });
        }
        catch (NotFoundException ex)
        {
            await WriteApp(context, HttpStatusCode.NotFound, ex);
        }
        catch (ConflictException ex)
        {
            await WriteApp(context, HttpStatusCode.Conflict, ex);
        }
        catch (ForbiddenException ex)
        {
            await WriteApp(context, HttpStatusCode.Forbidden, ex);
        }
        catch (UnauthorizedAccessException ex)
        {
            await WriteJson(context, (int)HttpStatusCode.Unauthorized, new
            {
                title = ex.Message,
                status = 401,
                code = ErrorCodes.Unauthorized
            });
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            await WriteJson(context, (int)HttpStatusCode.Conflict, new
            {
                // The unique index caught two people booking the same slot at the same moment
                title = "Tiden er lige blevet booket af en anden. Prøv en anden tid.",
                status = 409,
                code = ErrorCodes.SlotTaken
            });
        }
        catch (Exception ex)
        {
            SentrySdk.CaptureException(ex);
            logger.LogError(ex, "Unhandled exception");
            await WriteJson(context, (int)HttpStatusCode.InternalServerError, new
            {
                title = "An unexpected error occurred",
                status = 500,
                code = ErrorCodes.Unexpected
            });
        }
    }

    private static Task WriteApp(HttpContext context, HttpStatusCode status, AppException ex) =>
        WriteJson(context, (int)status, new
        {
            title = ex.Message,
            status = (int)status,
            code = ex.Code,
            @params = ex.Parameters,
        });

    private static Task WriteJson(HttpContext context, int statusCode, object body)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync(JsonSerializer.Serialize(body));
    }
}
