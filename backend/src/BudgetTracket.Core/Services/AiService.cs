using System.Text;
using System.Text.Json;
using Amazon.BedrockRuntime;
using Amazon.BedrockRuntime.Model;
using BudgetTracket.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BudgetTracket.Core.Services;

public class AiService : IAiService
{
    private readonly IAmazonBedrockRuntime _bedrock;
    private readonly ITransactionRepository _txnRepo;
    private readonly ILogger<AiService> _logger;
    private readonly string _modelId;

    private static readonly string[] ValidCategories =
        ["food", "shopping", "bills", "entertainment", "transport", "health", "education", "other"];

    public AiService(IAmazonBedrockRuntime bedrock, ITransactionRepository txnRepo, ILogger<AiService> logger)
    {
        _bedrock = bedrock;
        _txnRepo = txnRepo;
        _logger = logger;
        _modelId = Environment.GetEnvironmentVariable("BEDROCK_MODEL_ID") ?? "anthropic.claude-3-haiku-20240307-v1:0";
    }

    public async Task<string> SuggestCategoryAsync(string description, decimal amount, CancellationToken ct = default)
    {
        var prompt = $"""
            Phân loại giao dịch sau vào MỘT trong các danh mục: food, shopping, bills, entertainment, transport, health, education, other.
            Mô tả: "{description}", Số tiền: {amount:N0} VND.
            Chỉ trả về tên danh mục, không giải thích.
            """;

        try
        {
            var body = JsonSerializer.Serialize(new
            {
                anthropic_version = "bedrock-2023-05-31",
                max_tokens = 20,
                messages = new[] { new { role = "user", content = prompt } }
            });

            var response = await _bedrock.InvokeModelAsync(new InvokeModelRequest
            {
                ModelId = _modelId,
                Body = new MemoryStream(Encoding.UTF8.GetBytes(body)),
                ContentType = "application/json",
            }, ct);

            var result = await JsonDocument.ParseAsync(response.Body, cancellationToken: ct);
            var category = result.RootElement
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString()
                ?.Trim().ToLower() ?? "other";

            return ValidCategories.Contains(category) ? category : "other";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Bedrock categorization failed, defaulting to 'other'");
            return "other";
        }
    }

    public async Task<AiInsights> GetInsightsAsync(string userId, CancellationToken ct = default)
    {
        var txns = await _txnRepo.ListAsync(userId, new TransactionFilter { Limit = 100 }, ct);
        var expenses = txns.Items.Where(t => t.Type == "expense").ToList();

        if (!expenses.Any())
            return new AiInsights { Summary = "Chưa có đủ dữ liệu để phân tích." };

        var summary = expenses
            .GroupBy(t => t.Category)
            .Select(g => $"{g.Key}: {g.Sum(t => t.Amount):N0} VND")
            .Take(5);

        var summaryStr = string.Join(", ", summary);
        var prompt = $"Dựa trên dữ liệu chi tiêu sau của người dùng, hãy đưa ra 3 lời khuyên tài chính ngắn gọn bằng tiếng Việt:\n{summaryStr}\nTrả về JSON: {{\"summary\": \"...\", \"recommendations\": [\"...\",\"...\",\"...\"]}}";


        try
        {
            var body = JsonSerializer.Serialize(new
            {
                anthropic_version = "bedrock-2023-05-31",
                max_tokens = 500,
                messages = new[] { new { role = "user", content = prompt } }
            });

            var response = await _bedrock.InvokeModelAsync(new InvokeModelRequest
            {
                ModelId = _modelId,
                Body = new MemoryStream(Encoding.UTF8.GetBytes(body)),
                ContentType = "application/json",
            }, ct);

            var result = await JsonDocument.ParseAsync(response.Body, cancellationToken: ct);
            var text = result.RootElement
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString() ?? "{}";

            var insights = JsonSerializer.Deserialize<AiInsightsRaw>(text);
            return new AiInsights
            {
                Summary = insights?.Summary ?? string.Empty,
                Recommendations = insights?.Recommendations ?? [],
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Bedrock insights failed");
            return new AiInsights { Summary = "Không thể tải phân tích lúc này." };
        }
    }

    private record AiInsightsRaw(string Summary, string[] Recommendations);
}
