using FavoriteProducts.Data.Entities;
using FavoriteProducts.DTO;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FavoriteProducts.Endpoints;

public static class ApplicationEndpoints
{
    public static WebApplication MapApplicationEndpoints(this WebApplication app)
    {
        app.MapGet("/products", async Task<Ok<List<Product>>> (AppDbContext db) =>
        {
            var products = await db.Products.ToListAsync();

            return TypedResults.Ok(products);
        }).RequireAuthorization();

        app.MapGet("/users", async Task<Ok<List<User>>> (AppDbContext db) =>
        {
            var users = await db.Users.ToListAsync();

            return TypedResults.Ok(users);
        }).RequireAuthorization(policy => policy.RequireRole("Admin"));

        app.MapGet("/favorites", async Task<Ok<List<int>>> (
            AppDbContext db,
            HttpContext http) =>
        {
            var userId = int.Parse(http.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var favorites = await db.FavoriteProducts
                .Where(f => f.UserId == userId)
                .Select(f => f.ProductId)
                .ToListAsync();

            return TypedResults.Ok(favorites);
        }).RequireAuthorization();

        app.MapPost("/register", async Task<Ok> (
            AppDbContext db,
            CreateUserDto dto) =>
        {
            var user = new User
            {
                UserName = dto.UserName,
                Password = dto.Password
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return TypedResults.Ok();
        });

        app.MapPost("/favorites/{productId}", async Task<Ok<string>> (
            AppDbContext db,
            HttpContext http,
            int productId) =>
        {
            var userId = int.Parse(http.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var favorite = new FavoriteProduct
            {
                UserId = userId,
                ProductId = productId
            };

            db.FavoriteProducts.Add(favorite);
            await db.SaveChangesAsync();

            return TypedResults.Ok("added to favorites");
        }).RequireAuthorization();

        app.MapPost("/login", async Task<Results<Ok<LoginResponseDto>, UnauthorizedHttpResult>> (
            LoginDto dto,
            AppDbContext db,
            IConfiguration config) =>
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

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Role, role),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:Key"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var jwtExpirationHours = config.GetValue<int>("Jwt:ExpirationHours");

            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(jwtExpirationHours),
                signingCredentials: creds
            );

            var response = new LoginResponseDto(
                user.UserName,
                role,
                new JwtSecurityTokenHandler().WriteToken(token)
            );

            return TypedResults.Ok(response);
        });

        app.MapPost("/admin/login-as/{userId}", async Task<Results<Ok<TokenResponseDto>, NotFound<string>>> (
            int userId,
            AppDbContext db,
            IConfiguration config) =>
        {
            var user = await db.Users.FindAsync(userId);

            if (user == null)
            {
                return TypedResults.NotFound("User not found");
            }

            var role = "User";

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Role, role),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),

                new Claim("isImpersonating", "true"),
                new Claim("originalRole", "Admin")
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:Key"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var jwtExpirationHours = config.GetValue<int>("Jwt:ExpirationHours");

            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(jwtExpirationHours),
                signingCredentials: creds
            );

            var response = new TokenResponseDto(
                new JwtSecurityTokenHandler().WriteToken(token)
            );

            return TypedResults.Ok(response);
        }).RequireAuthorization(policy => policy.RequireRole("Admin"));

        app.MapDelete("/favorites/{productId}", async Task<Results<Ok, NotFound>> (
            AppDbContext db,
            HttpContext http,
            int productId) =>
        {
            var userId = int.Parse(http.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var favorite = await db.FavoriteProducts
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ProductId == productId);

            if (favorite == null)
            {
                return TypedResults.NotFound();
            }

            db.FavoriteProducts.Remove(favorite);
            await db.SaveChangesAsync();

            return TypedResults.Ok();
        }).RequireAuthorization();

        return app;
    }
}