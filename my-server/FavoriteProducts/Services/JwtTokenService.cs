using FavoriteProducts.Data.Entities;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace FavoriteProducts.Services
{
    public class JwtTokenService
    {
        public static string GenerateJwtToken(
       User user,
       string role,
       IConfiguration config,
       IEnumerable<Claim>? extraClaims = null)
        {
            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Role, role),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

            if (extraClaims != null)
            {
                claims.AddRange(extraClaims);
            }

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

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
