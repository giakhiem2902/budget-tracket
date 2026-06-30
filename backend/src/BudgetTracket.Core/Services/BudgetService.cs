using BudgetTracket.Core.Models;
using BudgetTracket.Core.Repositories;

namespace BudgetTracket.Core.Services;

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _repo;

    public BudgetService(IBudgetRepository repo) => _repo = repo;

    public Task<IEnumerable<Budget>> ListCurrentMonthAsync(string userId, CancellationToken ct = default) =>
        _repo.ListByMonthAsync(userId, DateTime.UtcNow.ToString("yyyy-MM"), ct);

    public Task<IEnumerable<Budget>> ListByMonthAsync(string userId, int year, int month, CancellationToken ct = default) =>
        _repo.ListByMonthAsync(userId, $"{year:D4}-{month:D2}", ct);

    public async Task<Budget> CreateOrUpdateAsync(string userId, string category, decimal limit, CancellationToken ct = default)
    {
        var yearMonth = DateTime.UtcNow.ToString("yyyy-MM");
        var existing = await _repo.GetAsync(userId, yearMonth, category, ct);
        var budget = existing ?? new Budget
        {
            PK = Budget.BuildPK(userId),
            SK = Budget.BuildSK(yearMonth, category),
            UserId = userId,
            Category = category,
            YearMonth = yearMonth,
        };
        budget.Limit = limit;
        return await _repo.SaveAsync(budget, ct);
    }
}
