using BudgetTracket.Core.Models;

namespace BudgetTracket.Core.Services;

public interface IBudgetService
{
    Task<IEnumerable<Budget>> ListCurrentMonthAsync(string userId, CancellationToken ct = default);
    Task<IEnumerable<Budget>> ListByMonthAsync(string userId, int year, int month, CancellationToken ct = default);
    Task<Budget> CreateOrUpdateAsync(string userId, string category, decimal limit, CancellationToken ct = default);
}
