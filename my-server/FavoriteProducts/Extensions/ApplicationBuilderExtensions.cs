namespace FavoriteProducts.Extensions;

public static class ApplicationBuilderExtensions
{
    public static WebApplication UseApplicationMiddlewares(this WebApplication app)
    {
        app.UseHttpsRedirection();

        app.UseCors(ServiceCollectionExtensions.CorsPolicyName);

        app.UseAuthentication();

        app.UseAuthorization();

        return app;
    }
}