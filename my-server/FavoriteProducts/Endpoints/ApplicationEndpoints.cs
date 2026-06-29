namespace FavoriteProducts.Endpoints;

public static class ApplicationEndpoints
{
    public static WebApplication MapApplicationEndpoints(this WebApplication app)
    {
        app.MapAuthEndpoints();
        app.MapAdminEndpoints();
        app.MapProductEndpoints();
        app.MapFavoriteEndpoints();

        return app;
    }
}