using Application.Common.Exceptions;
using FluentValidation;
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
                title = "Validation failed",
                status = 422,
                errors = ex.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())
            });
        }
        catch (NotFoundException ex)
        {
            await WriteJson(context, (int)HttpStatusCode.NotFound, new
            {
                title = ex.Message,
                status = 404
            });
        }
        catch (ForbiddenException ex)
        {
            await WriteJson(context, (int)HttpStatusCode.Forbidden, new
            {
                title = ex.Message,
                status = 403
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            await WriteJson(context, (int)HttpStatusCode.Unauthorized, new
            {
                title = ex.Message,
                status = 401
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            await WriteJson(context, (int)HttpStatusCode.InternalServerError, new
            {
                title = "An unexpected error occurred",
                status = 500
            });
        }
    }

    private static Task WriteJson(HttpContext context, int statusCode, object body)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync(JsonSerializer.Serialize(body));
    }
}
