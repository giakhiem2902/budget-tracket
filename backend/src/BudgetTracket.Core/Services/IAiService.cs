namespace BudgetTracket.Core.Services;

public interface IAiService
{
    Task<string> SuggestCategoryAsync(string description, decimal amount, CancellationToken ct = default);
    Task<AiInsights> GetInsightsAsync(string userId, CancellationToken ct = default);
}

public record AiInsights
{
    public string Summary { get; init; } = string.Empty;
    public IEnumerable<string> Recommendations { get; init; } = [];
    public IEnumerable<SpendingAnomaly> Anomalies { get; init; } = [];
}

public record SpendingAnomaly
{
    public string Category { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public decimal Amount { get; init; }
}
