using FavoriteProducts.Data.Entities;
using FavoriteProducts.DTO;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Caching.Memory;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddMemoryCache();

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
builder.Services.AddAuthorization();
var app = builder.Build();

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.UseHttpsRedirection();
app.MapGet("/products", async (AppDbContext db) =>
{
    return await db.Products.ToListAsync();
}).RequireAuthorization();
app.MapGet("/users", async (AppDbContext db) =>
{
    return await db.Users.ToListAsync();
}).RequireAuthorization(policy => policy.RequireRole("Admin"));
app.MapGet("/favorites", async (AppDbContext db, HttpContext http) =>
{
    var userId = int.Parse(http.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    var favorites = await db.FavoriteProducts
        .Where(f => f.UserId == userId)
        .Select(f => f.ProductId)
        .ToListAsync();

    return Results.Ok(favorites);
}).RequireAuthorization();
app.MapPost("/register", async (AppDbContext db, CreateUserDto dto) =>
{
    var user = new User
    {
        UserName = dto.UserName,
        Password=dto.Password
    };
    db.Users.Add(user);
    await db.SaveChangesAsync();

    return Results.Ok();
});
app.MapPost("/favorites/{productId}", async (AppDbContext db, HttpContext http, int productId) =>
{
    var userId = int.Parse(http.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    var favorite = new FavoriteProduct { UserId = userId, ProductId = productId };
    db.FavoriteProducts.Add(favorite);
    await db.SaveChangesAsync();

    return Results.Ok("added to favorites");
}).RequireAuthorization();
app.MapPost("/login", (LoginDto dto, AppDbContext db, IConfiguration config) =>
{
    User? user;
    string role;

    const string adminUser = "admin";
    const string adminPass = "1234";

    // מנהל
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
        // משתמש רגיל
        user = db.Users.FirstOrDefault(u =>
            u.UserName == dto.UserName && u.Password == dto.Password);

        if (user == null)
            return Results.Unauthorized();

        role = "User";
    }

    var claims = new[]
    {
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(ClaimTypes.Role, role),
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())

    };

    var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(config["Jwt:Key"]));

    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: config["Jwt:Issuer"],
        audience: config["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddHours(1),
        signingCredentials: creds
    );

    return Results.Ok(new
    {
        UserName = user.UserName,
        Role = role,
        token = new JwtSecurityTokenHandler().WriteToken(token)
    });
});
app.MapPost("/admin/login-as/{userId}", async (int userId, AppDbContext db, IConfiguration config) =>
{
    var user = await db.Users.FindAsync(userId);

    if (user == null)
        return Results.NotFound("User not found");

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
        Encoding.UTF8.GetBytes(config["Jwt:Key"]));

    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: config["Jwt:Issuer"],
        audience: config["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddHours(1),
        signingCredentials: creds
    );

    return Results.Ok(new
    {
        token = new JwtSecurityTokenHandler().WriteToken(token)
    });
}).RequireAuthorization(policy => policy.RequireRole("Admin"));

app.MapDelete("/favorites/{productId}", async (AppDbContext db, HttpContext http, int productId) =>
{
    var userId = int.Parse(http.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    var favorite = await db.FavoriteProducts
        .FirstOrDefaultAsync(f => f.UserId == userId && f.ProductId == productId);

    if (favorite == null) return Results.NotFound();

    db.FavoriteProducts.Remove(favorite);
    await db.SaveChangesAsync();

    return Results.Ok();
}).RequireAuthorization(); 
app.Run();

