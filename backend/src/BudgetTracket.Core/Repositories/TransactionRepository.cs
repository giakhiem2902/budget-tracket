using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using BudgetTracket.Core.Models;
using Microsoft.Extensions.Logging;

namespace BudgetTracket.Core.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly IDynamoDBContext _db;
    private readonly ILogger<TransactionRepository> _logger;
    private static readonly string TableName =
        Environment.GetEnvironmentVariable("DYNAMODB_TABLE") ?? "BudgetTracket-dev";

    public TransactionRepository(IDynamoDBContext db, ILogger<TransactionRepository> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<PagedResult<Transaction>> ListAsync(string userId, TransactionFilter filter, CancellationToken ct = default)
    {
        var config = new DynamoDBOperationConfig
        {
            OverrideTableName = TableName,
            QueryFilter = [],
            BackwardQuery = true,
        };

        if (!string.IsNullOrEmpty(filter.Type))
            config.QueryFilter.Add(new ScanCondition("Type", ScanOperator.Equal, filter.Type));

        var query = _db.QueryAsync<Transaction>(
            Transaction.BuildPK(userId),
            QueryOperator.BeginsWith,
            ["TXN#"],
            config
        );

        var items = new List<Transaction>();
        do
        {
            var page = await query.GetNextSetAsync(ct);
            items.AddRange(page);
        } while (!query.IsDone && items.Count < filter.Limit);

        if (!string.IsNullOrEmpty(filter.Search))
            items = items.Where(t =>
                t.Description.Contains(filter.Search, StringComparison.OrdinalIgnoreCase)
            ).ToList();

        return new PagedResult<Transaction>
        {
            Items = items.Take(filter.Limit),
            Total = items.Count,
        };
    }

    public async Task<Transaction?> GetAsync(string userId, string transactionId, CancellationToken ct = default)
    {
        var all = await ListAsync(userId, new TransactionFilter { Limit = 1000 }, ct);
        return all.Items.FirstOrDefault(t => t.Id == transactionId);
    }

    public async Task<Transaction> CreateAsync(Transaction transaction, CancellationToken ct = default)
    {
        await _db.SaveAsync(transaction, new DynamoDBOperationConfig { OverrideTableName = TableName }, ct);
        _logger.LogInformation("Created transaction {Id} for user {UserId}", transaction.Id, transaction.UserId);
        return transaction;
    }

    public async Task<Transaction> UpdateAsync(Transaction transaction, CancellationToken ct = default)
    {
        transaction.CreatedAt = DateTime.UtcNow.ToString("O");
        await _db.SaveAsync(transaction, new DynamoDBOperationConfig { OverrideTableName = TableName }, ct);
        return transaction;
    }

    public async Task DeleteAsync(string userId, string transactionId, CancellationToken ct = default)
    {
        var existing = await GetAsync(userId, transactionId, ct);
        if (existing is not null)
            await _db.DeleteAsync(existing, new DynamoDBOperationConfig { OverrideTableName = TableName }, ct);
    }
}
