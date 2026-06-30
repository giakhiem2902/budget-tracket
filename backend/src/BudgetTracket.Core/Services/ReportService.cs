using BudgetTracket.Core.Repositories;

namespace BudgetTracket.Core.Services;

public interface IReportService
{
    Task<ReportSummary> GetSummaryAsync(string userId, CancellationToken ct = default);
    Task<IEnumerable<MonthlyTrend>> GetTrendsAsync(string userId, int months = 6, CancellationToken ct = default);
    Task<IEnumerable<CategoryBreakdown>> GetCategoriesAsync(string userId, string yearMonth, CancellationToken ct = default);
}

public record ReportSummary
{
    public decimal Balance { get; init; }
    public decimal Income { get; init; }
    public decimal Expense { get; init; }
    public decimal Savings { get; init; }
    public decimal IncomeTrend { get; init; }
    public decimal ExpenseTrend { get; init; }
    public IEnumerable<MonthlyTrend> Trends { get; init; } = [];
    public IEnumerable<CategoryBreakdown> Categories { get; init; } = [];
}

public record MonthlyTrend { public string Month { get; init; } = ""; public decimal Income { get; init; } public decimal Expense { get; init; } }
public record CategoryBreakdown { public string Name { get; init; } = ""; public decimal Value { get; init; } public string Color { get; init; } = "#6b7280"; }

public class ReportService : IReportService
{
    private readonly ITransactionRepository _txnRepo;
    private static readonly Dictionary<string, string> CategoryColors = new()
    {
        ["food"] = "#f59e0b", ["shopping"] = "#6366f1", ["bills"] = "#ef4444",
        ["entertainment"] = "#8b5cf6", ["transport"] = "#10b981",
        ["health"] = "#06b6d4", ["education"] = "#f97316", ["other"] = "#6b7280",
    };

    public ReportService(ITransactionRepository txnRepo) => _txnRepo = txnRepo;

    public async Task<ReportSummary> GetSummaryAsync(string userId, CancellationToken ct = default)
    {
        var txns = (await _txnRepo.ListAsync(userId, new TransactionFilter { Limit = 1000 }, ct)).Items.ToList();
        var now = DateTime.UtcNow;
        var thisMonth = txns.Where(t => t.Date.StartsWith(now.ToString("yyyy-MM")));

        var income = thisMonth.Where(t => t.Type == "income").Sum(t => t.Amount);
        var expense = thisMonth.Where(t => t.Type == "expense").Sum(t => t.Amount);

        var categories = txns
            .Where(t => t.Type == "expense" && t.Date.StartsWith(now.ToString("yyyy-MM")))
            .GroupBy(t => t.Category)
            .Select(g => new CategoryBreakdown
            {
                Name = g.Key,
                Value = g.Sum(t => t.Amount),
                Color = CategoryColors.GetValueOrDefault(g.Key, "#6b7280"),
            });

        var trends = await GetTrendsAsync(userId, 6, ct);

        return new ReportSummary
        {
            Balance = income - expense,
            Income = income,
            Expense = expense,
            Savings = Math.Max(0, income - expense),
            Trends = trends,
            Categories = categories,
        };
    }

    public async Task<IEnumerable<MonthlyTrend>> GetTrendsAsync(string userId, int months = 6, CancellationToken ct = default)
    {
        var txns = (await _txnRepo.ListAsync(userId, new TransactionFilter { Limit = 1000 }, ct)).Items;
        var result = new List<MonthlyTrend>();
        for (int i = months - 1; i >= 0; i--)
        {
            var month = DateTime.UtcNow.AddMonths(-i);
            var prefix = month.ToString("yyyy-MM");
            var monthTxns = txns.Where(t => t.Date.StartsWith(prefix));
            result.Add(new MonthlyTrend
            {
                Month = $"T{month.Month}",
                Income = monthTxns.Where(t => t.Type == "income").Sum(t => t.Amount),
                Expense = monthTxns.Where(t => t.Type == "expense").Sum(t => t.Amount),
            });
        }
        return result;
    }

    public async Task<IEnumerable<CategoryBreakdown>> GetCategoriesAsync(string userId, string yearMonth, CancellationToken ct = default)
    {
        var txns = (await _txnRepo.ListAsync(userId, new TransactionFilter { Limit = 1000 }, ct)).Items;
        return txns
            .Where(t => t.Type == "expense" && t.Date.StartsWith(yearMonth))
            .GroupBy(t => t.Category)
            .Select(g => new CategoryBreakdown
            {
                Name = g.Key,
                Value = g.Sum(t => t.Amount),
                Color = CategoryColors.GetValueOrDefault(g.Key, "#6b7280"),
            });
    }
}
