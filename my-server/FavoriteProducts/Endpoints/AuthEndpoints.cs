using FavoriteProducts.Data.Entities;
using FavoriteProducts.DTO;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using FavoriteProducts.Services;
namespace FavoriteProducts.Endpoints;

public static class AuthEndpoints
{
    public static WebApplication MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/register", Register);

        app.MapPost("/login", Login);

        return app;
    }

    private static async Task<Ok> Register(
        AppDbContext db,
        CreateUserDto dto)
    {
        var user = new User
        {
            UserName = dto.UserName,
            Password = dto.Password
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return TypedResults.Ok();
    }

    private static async Task<Results<Ok<LoginResponseDto>, UnauthorizedHttpResult>> Login(
        LoginDto dto,
        AppDbContext db,
        IConfiguration config)
    {
        User? user;
        string role;

        var adminUser = config["AdminUser:UserName"]!;
        var adminPass = config["AdminUser:Password"]!;

        if (dto.UserName == adminUser && dto.Password == adminPass)
        {
            role = "Admin";

            user = new User
            {
                UserName = adminUser
            };
        }
        else
        {
            user = await db.Users.FirstOrDefaultAsync(u =>
                u.UserName == dto.UserName && u.Password == dto.Password);

            if (user == null)
            {
                return TypedResults.Unauthorized();
            }

            role = "User";
        }

        var token = JwtTokenService.GenerateJwtToken(user, role, config);

        var response = new LoginResponseDto(
            user.UserName,
            role,
            token
        );

        return TypedResults.Ok(response);
    }

   
}