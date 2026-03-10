using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PingController : ControllerBase
{
    private readonly IHostEnvironment _env;

    public PingController(IHostEnvironment env)
    {
        _env = env;
    }

    [HttpGet]
    public IActionResult Get() => Ok(new
    {
        message = "pong",
        environment = _env.EnvironmentName,
        serverTime = DateTimeOffset.UtcNow,
        version = "1.0.0"
    });
}
