namespace FavoriteProducts.DTO;

public record LoginResponseDto(
    string UserName,
    string Role,
    string Token
);

public record TokenResponseDto(
    string Token
);