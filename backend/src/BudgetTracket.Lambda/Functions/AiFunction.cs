using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using BudgetTracket.Core.Models;
using BudgetTracket.Core.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BudgetTracket.Lambda.Functions;

public class AiFunction
{
    private readonly IServiceProvider _sp;
    public AiFunction() => _sp = Startup.BuildServiceProvider();

    public async Task<APIGatewayProxyResponse> HandleAsync(APIGatewayProxyRequest request, ILambdaContext context)
    {
        using var scope = _sp.CreateScope();
        var svc = scope.ServiceProvider.GetRequiredService<IAiService>();
        var userId = request.RequestContext?.Authorizer?.Claims?.GetValueOrDefault("sub");
        if (userId is null) return Response(401, ApiResponse<object>.Fail("Unauthorized"));

        try
        {
            var path = request.Path.Split('/').Last();

            if (path == "categorize" && request.HttpMethod == "POST")
            {
                var body = JsonDocument.Parse(request.Body ?? "{}").RootElement;
                var desc = body.TryGetProperty("description", out var d) ? d.GetString() ?? "" : "";
                var amount = body.TryGetProperty("amount", out var a) ? a.GetDecimal() : 0;
                var category = await svc.SuggestCategoryAsync(desc, amount);
                return Response(200, ApiResponse<object>.Ok(new { category }));
            }

            if (path == "insights" && request.HttpMethod == "GET")
            {
                var insights = await svc.GetInsightsAsync(userId);
                return Response(200, ApiResponse<object>.Ok(insights));
            }

            return Response(404, ApiResponse<object>.Fail("Not found"));
        }
        catch (Exception ex)
        {
            context.Logger.LogError($"AI error: {ex.Message}");
            return Response(500, ApiResponse<object>.Fail("Internal server error"));
        }
    }

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    private static APIGatewayProxyResponse Response<T>(int code, T body) => new()
    {
        StatusCode = code,
        Body = JsonSerializer.Serialize(body, JsonOpts),
        Headers = new Dictionary<string, string>
        {
            ["Content-Type"] = "application/json",
            ["Access-Control-Allow-Origin"] = "*",
            ["Access-Control-Allow-Headers"] = "Content-Type,Authorization",
            ["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS",
        },
    };
}
