using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using BudgetTracket.Core.Models;
using BudgetTracket.Core.Repositories;
using BudgetTracket.Core.Services;
using BudgetTracket.Core.Validators;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace BudgetTracket.Lambda.Functions;

public class TransactionFunction
{
    private readonly IServiceProvider _sp;

    public TransactionFunction() => _sp = Startup.BuildServiceProvider();

    public async Task<APIGatewayProxyResponse> HandleAsync(APIGatewayProxyRequest request, ILambdaContext context)
    {
        using var scope = _sp.CreateScope();
        var svc = scope.ServiceProvider.GetRequiredService<ITransactionService>();
        var userId = GetUserId(request);
        if (userId is null) return Unauthorized();

        try
        {
            return request.HttpMethod switch
            {
                "GET" when request.PathParameters?.ContainsKey("id") != true =>
                    await ListTransactions(svc, userId, request),
                "POST" when request.Path.Contains("/receipt") =>
                    await GetReceiptUploadUrl(svc, userId, request),
                "POST" =>
                    await CreateTransaction(svc, userId, request),
                "PUT" =>
                    await UpdateTransaction(svc, userId, request),
                "DELETE" =>
                    await DeleteTransaction(svc, userId, request),
                _ => NotFound()
            };
        }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
        catch (ValidationException ex) { return BadRequest(string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))); }
        catch (Exception ex)
        {
            context.Logger.LogError($"Error: {ex.Message}");
            return ServerError();
        }
    }

    private static async Task<APIGatewayProxyResponse> ListTransactions(
        ITransactionService svc, string userId, APIGatewayProxyRequest req)
    {
        var q = req.QueryStringParameters;
        static string? Get(IDictionary<string, string>? d, string k) =>
            d is not null && d.TryGetValue(k, out var v) ? v : null;
        var filter = new TransactionFilter
        {
            Type = Get(q, "type"),
            Category = Get(q, "category"),
            Search = Get(q, "search"),
            Limit = int.TryParse(Get(q, "limit"), out var l) ? l : 50,
        };
        var result = await svc.ListAsync(userId, filter);
        return Ok(ApiResponse<PagedResult<Transaction>>.Ok(result));
    }

    private static async Task<APIGatewayProxyResponse> CreateTransaction(
        ITransactionService svc, string userId, APIGatewayProxyRequest req)
    {
        var input = JsonSerializer.Deserialize<CreateTransactionInput>(req.Body ?? "{}",
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
            ?? throw new ValidationException("Invalid request body");

        var validator = new CreateTransactionValidator();
        await validator.ValidateAndThrowAsync(input);

        var txn = await svc.CreateAsync(userId, input);
        return Created(ApiResponse<Transaction>.Ok(txn, "Tạo giao dịch thành công"));
    }

    private static async Task<APIGatewayProxyResponse> UpdateTransaction(
        ITransactionService svc, string userId, APIGatewayProxyRequest req)
    {
        var id = req.PathParameters?["id"] ?? throw new ValidationException("Missing transaction id");
        var input = JsonSerializer.Deserialize<UpdateTransactionInput>(req.Body ?? "{}",
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
        var txn = await svc.UpdateAsync(userId, id, input);
        return Ok(ApiResponse<Transaction>.Ok(txn));
    }

    private static async Task<APIGatewayProxyResponse> DeleteTransaction(
        ITransactionService svc, string userId, APIGatewayProxyRequest req)
    {
        var id = req.PathParameters?["id"] ?? throw new ValidationException("Missing transaction id");
        await svc.DeleteAsync(userId, id);
        return Ok(ApiResponse<object>.Ok(new { }, "Xóa thành công"));
    }

    private static async Task<APIGatewayProxyResponse> GetReceiptUploadUrl(
        ITransactionService svc, string userId, APIGatewayProxyRequest req)
    {
        var id = req.PathParameters?["id"] ?? throw new ValidationException("Missing transaction id");
        var body = JsonDocument.Parse(req.Body ?? "{}").RootElement;
        var contentType = body.TryGetProperty("contentType", out var ct) ? ct.GetString() ?? "image/jpeg" : "image/jpeg";
        var (uploadUrl, viewUrl) = await svc.GetReceiptUploadUrlAsync(userId, id, contentType);
        return Ok(ApiResponse<object>.Ok(new { uploadUrl, viewUrl }));
    }

    // Helpers
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    private static string? GetUserId(APIGatewayProxyRequest req) =>
        req.RequestContext?.Authorizer?.Claims?.GetValueOrDefault("sub");

    private static APIGatewayProxyResponse Ok<T>(T body) => Response(200, body);
    private static APIGatewayProxyResponse Created<T>(T body) => Response(201, body);
    private static APIGatewayProxyResponse BadRequest(string msg) => Response(400, new { error = msg });
    private static APIGatewayProxyResponse Unauthorized() => Response(401, new { error = "Unauthorized" });
    private static APIGatewayProxyResponse NotFound(string? msg = null) => Response(404, new { error = msg ?? "Not found" });
    private static APIGatewayProxyResponse ServerError() => Response(500, new { error = "Internal server error" });

    private static APIGatewayProxyResponse Response<T>(int statusCode, T body) => new()
    {
        StatusCode = statusCode,
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
