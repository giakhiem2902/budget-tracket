using BudgetTracket.Core.Models;
using BudgetTracket.Core.Repositories;

namespace BudgetTracket.Core.Services;

public interface ITransactionService
{
    Task<PagedResult<Transaction>> ListAsync(string userId, TransactionFilter filter, CancellationToken ct = default);
    Task<Transaction> CreateAsync(string userId, CreateTransactionInput input, CancellationToken ct = default);
    Task<Transaction> UpdateAsync(string userId, string transactionId, UpdateTransactionInput input, CancellationToken ct = default);
    Task DeleteAsync(string userId, string transactionId, CancellationToken ct = default);
    Task<(string UploadUrl, string ViewUrl)> GetReceiptUploadUrlAsync(string userId, string transactionId, string contentType, CancellationToken ct = default);
}

public record CreateTransactionInput
{
    public required string Type { get; init; }
    public required string Description { get; init; }
    public required decimal Amount { get; init; }
    public required string Category { get; init; }
    public required string Date { get; init; }
    public string? Note { get; init; }
}

public record UpdateTransactionInput
{
    public string? Description { get; init; }
    public decimal? Amount { get; init; }
    public string? Category { get; init; }
    public string? Date { get; init; }
    public string? Note { get; init; }
}
