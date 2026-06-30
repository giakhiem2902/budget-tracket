using BudgetTracket.Core.Models;

namespace BudgetTracket.Core.Repositories;

public interface ITransactionRepository
{
    Task<PagedResult<Transaction>> ListAsync(string userId, TransactionFilter filter, CancellationToken ct = default);
    Task<Transaction?> GetAsync(string userId, string transactionId, CancellationToken ct = default);
    Task<Transaction> CreateAsync(Transaction transaction, CancellationToken ct = default);
    Task<Transaction> UpdateAsync(Transaction transaction, CancellationToken ct = default);
    Task DeleteAsync(string userId, string transactionId, CancellationToken ct = default);
}

public record TransactionFilter
{
    public string? Type { get; init; }
    public string? Category { get; init; }
    public string? Search { get; init; }
    public string? FromDate { get; init; }
    public string? ToDate { get; init; }
    public int Limit { get; init; } = 50;
    public string? NextPageToken { get; init; }
}
