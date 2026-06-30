using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using BudgetTracket.Core.Models;
using BudgetTracket.Core.Services;
using BudgetTracket.Core.Validators;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace BudgetTracket.Lambda.Functions;

public class BudgetFunction
{
    private readonly IServiceProvider _sp;
    public BudgetFunction() => _sp = Startup.BuildServiceProvider();

    public async Task<APIGatewayProxyResponse> HandleAsync(APIGatewayProxyRequest request, ILambdaContext context)
    {
        using var scope = _sp.CreateScope();
        var svc = scope.ServiceProvider.GetRequiredService<IBudgetService>();
        var userId = request.RequestContext?.Authorizer?.Claims?.GetValueOrDefault("sub");
        if (userId is null) return Response(401, new { error = "Unauthorized" });

        try
        {
            if (request.HttpMethod == "GET")
            {
                var p = request.PathParameters;
                IEnumerable<Budget> budgets = p?.ContainsKey("year") == true
                    ? await svc.ListByMonthAsync(userId, int.Parse(p["year"]), int.Parse(p["month"]))
                    : await svc.ListCurrentMonthAsync(userId);
                return Response(200, ApiResponse<IEnumerable<Budget>>.Ok(budgets));
            }

            if (request.HttpMethod == "POST")
            {
                var req = JsonSerializer.Deserialize<CreateBudgetRequest>(request.Body ?? "{}",
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
                await new CreateBudgetValidator().ValidateAndThrowAsync(req);
                var budget = await svc.CreateOrUpdateAsync(userId, req.Category, req.Limit);
                return Response(200, ApiResponse<Budget>.Ok(budget));
            }

            return Response(404, new { error = "Not found" });
        }
        catch (ValidationException ex) { return Response(400, new { error = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage)) }); }
        catch (Exception ex)
        {
            context.Logger.LogError($"Budget error: {ex.Message}");
            return Response(500, new { error = "Internal server error" });
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
