using FavoriteProducts.Endpoints;
using FavoriteProducts.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

app.UseApplicationMiddlewares();

app.MapApplicationEndpoints();

app.Run();