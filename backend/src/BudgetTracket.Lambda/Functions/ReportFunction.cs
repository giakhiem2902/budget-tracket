using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using BudgetTracket.Core.Models;
using BudgetTracket.Core.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BudgetTracket.Lambda.Functions;

public class ReportFunction
{
    private readonly IServiceProvider _sp;
    public ReportFunction() => _sp = Startup.BuildServiceProvider();

    public async Task<APIGatewayProxyResponse> HandleAsync(APIGatewayProxyRequest request, ILambdaContext context)
    {
        using var scope = _sp.CreateScope();
        var svc = scope.ServiceProvider.GetRequiredService<IReportService>();
        var userId = request.RequestContext?.Authorizer?.Claims?.GetValueOrDefault("sub");
        if (userId is null) return Response(401, ApiResponse<object>.Fail("Unauthorized"));

        try
        {
            var path = request.Path.Split('/').Last();
            return path switch
            {
                "summary"    => Response(200, ApiResponse<ReportSummary>.Ok(await svc.GetSummaryAsync(userId))),
                "trends"     => Response(200, ApiResponse<IEnumerable<MonthlyTrend>>.Ok(await svc.GetTrendsAsync(userId))),
                "categories" => Response(200, ApiResponse<IEnumerable<CategoryBreakdown>>.Ok(
                                    await svc.GetCategoriesAsync(userId, DateTime.UtcNow.ToString("yyyy-MM")))),
                _            => Response(404, ApiResponse<object>.Fail("Not found")),
            };
        }
        catch (Exception ex)
        {
            context.Logger.LogError($"Report error: {ex.Message}");
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
