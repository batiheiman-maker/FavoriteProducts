using FavoriteProducts.DTO;
using FavoriteProducts.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
namespace FavoriteProducts.Endpoints;

public static class AdminEndpoints
{
    public static WebApplication MapAdminEndpoints(this WebApplication app)
    {
        app.MapGet("/users", GetUsers)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        app.MapPost("/admin/login-as/{userId}", LoginAs)
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        return app;
    }

    private static async Task<Ok<List<UserDto>>> GetUsers(AppDbContext db)
    {
        var users = await db.Users
            .Select(u => new UserDto(
                u.Id,
                u.UserName
            ))
            .ToListAsync();

        return TypedResults.Ok(users);
    }

    private static async Task<Results<Ok<TokenResponseDto>, NotFound<string>>> LoginAs(
        int userId,
        AppDbContext db,
        IConfiguration config)
    {
        var user = await db.Users.FindAsync(userId);

        if (user == null)
        {
            return TypedResults.NotFound("User not found");
        }

        var token = JwtTokenService.GenerateJwtToken(
            user,
            "User",
            config,
            new[]
            {
                new Claim("isImpersonating", "true"),
                new Claim("originalRole", "Admin")
            });

        var response = new TokenResponseDto(token);

        return TypedResults.Ok(response);
    }
}