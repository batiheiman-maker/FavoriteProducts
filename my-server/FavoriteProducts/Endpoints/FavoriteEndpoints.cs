using FavoriteProducts.Data.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FavoriteProducts.Endpoints;

public static class FavoriteEndpoints
{
    public static WebApplication MapFavoriteEndpoints(this WebApplication app)
    {
        app.MapGet("/favorites", GetFavorites)
            .RequireAuthorization();

        app.MapPost("/favorites/{productId}", AddFavorite)
            .RequireAuthorization();

        app.MapDelete("/favorites/{productId}", DeleteFavorite)
            .RequireAuthorization();

        return app;
    }

    private static async Task<Ok<List<int>>> GetFavorites(
        AppDbContext db,
        HttpContext http)
    {
        var userId = int.Parse(http.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var favorites = await db.FavoriteProducts
            .Where(f => f.UserId == userId)
            .Select(f => f.ProductId)
            .ToListAsync();

        return TypedResults.Ok(favorites);
    }

    private static async Task<Ok<string>> AddFavorite(
        AppDbContext db,
        HttpContext http,
        int productId)
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
    }

    private static async Task<Results<Ok, NotFound>> DeleteFavorite(
        AppDbContext db,
        HttpContext http,
        int productId)
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
    }
}