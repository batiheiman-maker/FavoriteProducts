using FavoriteProducts.Data.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace FavoriteProducts.Endpoints;

public static class ProductEndpoints
{
    public static WebApplication MapProductEndpoints(this WebApplication app)
    {
        app.MapGet("/products", GetProducts)
            .RequireAuthorization();

        return app;
    }

    private static async Task<Ok<List<Product>>> GetProducts(AppDbContext db)
    {
        var products = await db.Products.ToListAsync();

        return TypedResults.Ok(products);
    }
}