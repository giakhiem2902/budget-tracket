using BudgetTracket.Core.Models;

namespace BudgetTracket.Core.Repositories;

public interface IBudgetRepository
{
    Task<IEnumerable<Budget>> ListByMonthAsync(string userId, string yearMonth, CancellationToken ct = default);
    Task<Budget?> GetAsync(string userId, string yearMonth, string category, CancellationToken ct = default);
    Task<Budget> SaveAsync(Budget budget, CancellationToken ct = default);
    Task IncrementSpentAsync(string userId, string yearMonth, string category, decimal amount, CancellationToken ct = default);
}
