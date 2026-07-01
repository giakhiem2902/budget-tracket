using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using BudgetTracket.Core.Models;
using BudgetTracket.Core.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BudgetTracket.Lambda.Functions;

public class ProfileFunction
{
    private readonly IServiceProvider _sp;
    public ProfileFunction() => _sp = Startup.BuildServiceProvider();

    public async Task<APIGatewayProxyResponse> HandleAsync(APIGatewayProxyRequest request, ILambdaContext context)
    {
        using var scope = _sp.CreateScope();
        var svc = scope.ServiceProvider.GetRequiredService<IUserProfileService>();

        var claims = request.RequestContext?.Authorizer?.Claims;
        var userId = claims?.GetValueOrDefault("sub");
        if (userId is null) return Response(401, new { error = "Unauthorized" });

        var email = claims?.GetValueOrDefault("email") ?? string.Empty;
        var name  = claims?.GetValueOrDefault("name")  ?? string.Empty;

        try
        {
            return request.HttpMethod switch
            {
                "GET"    => await GetProfile(svc, userId, email, name),
                "PUT"    => await UpdateProfile(svc, userId, request),
                "DELETE" => await DeleteProfile(svc, userId),
                _        => Response(404, new { error = "Not found" })
            };
        }
        catch (KeyNotFoundException ex) { return Response(404, new { error = ex.Message }); }
        catch (Exception ex)
        {
            context.Logger.LogError($"ProfileFunction error: {ex.Message}");
            return Response(500, new { error = "Internal server error" });
        }
    }

    private static async Task<APIGatewayProxyResponse> GetProfile(
        IUserProfileService svc, string userId, string email, string name)
    {
        var profile = await svc.GetOrCreateAsync(userId, email, name);
        return Response(200, ApiResponse<UserProfile>.Ok(profile));
    }

    private static async Task<APIGatewayProxyResponse> UpdateProfile(
        IUserProfileService svc, string userId, APIGatewayProxyRequest req)
    {
        var input = JsonSerializer.Deserialize<UpdateProfileInput>(req.Body ?? "{}",
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
            ?? throw new ArgumentException("Invalid request body");

        var updated = await svc.UpdateAsync(userId, input);
        return Response(200, ApiResponse<UserProfile>.Ok(updated, "Cập nhật thành công"));
    }

    private static async Task<APIGatewayProxyResponse> DeleteProfile(
        IUserProfileService svc, string userId)
    {
        await svc.DeleteUserDataAsync(userId);
        return Response(200, ApiResponse<object>.Ok(new { }, "Tài khoản đã được xóa"));
    }

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    private static APIGatewayProxyResponse Response<T>(int statusCode, T body) => new()
    {
        StatusCode = statusCode,
        Body = JsonSerializer.Serialize(body, JsonOpts),
        Headers = new Dictionary<string, string>
        {
            ["Content-Type"] = "application/json",
            ["Access-Control-Allow-Origin"] = "*",
            ["Access-Control-Allow-Headers"] = "Content-Type,Authorization",
            ["Access-Control-Allow-Methods"] = "GET,PUT,DELETE,OPTIONS",
        },
    };
}
