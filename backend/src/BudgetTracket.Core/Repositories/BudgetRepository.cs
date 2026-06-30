using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using BudgetTracket.Core.Models;
using Microsoft.Extensions.Logging;

namespace BudgetTracket.Core.Repositories;

public class BudgetRepository : IBudgetRepository
{
    private readonly IDynamoDBContext _db;
    private readonly ILogger<BudgetRepository> _logger;
    private static readonly string TableName =
        Environment.GetEnvironmentVariable("DYNAMODB_TABLE") ?? "BudgetTracket-dev";

    public BudgetRepository(IDynamoDBContext db, ILogger<BudgetRepository> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IEnumerable<Budget>> ListByMonthAsync(string userId, string yearMonth, CancellationToken ct = default)
    {
        var query = _db.QueryAsync<Budget>(
            Budget.BuildPK(userId),
            QueryOperator.BeginsWith,
            [$"BUDGET#{yearMonth}#"],
            new DynamoDBOperationConfig { OverrideTableName = TableName }
        );

        var items = new List<Budget>();
        do { items.AddRange(await query.GetNextSetAsync(ct)); }
        while (!query.IsDone);

        return items;
    }

    public async Task<Budget?> GetAsync(string userId, string yearMonth, string category, CancellationToken ct = default)
    {
        return await _db.LoadAsync<Budget>(
            Budget.BuildPK(userId),
            Budget.BuildSK(yearMonth, category),
            new DynamoDBOperationConfig { OverrideTableName = TableName },
            ct
        );
    }

    public async Task<Budget> SaveAsync(Budget budget, CancellationToken ct = default)
    {
        budget.UpdatedAt = DateTime.UtcNow.ToString("O");
        await _db.SaveAsync(budget, new DynamoDBOperationConfig { OverrideTableName = TableName }, ct);
        _logger.LogInformation("Saved budget {Category} for user {UserId}", budget.Category, budget.UserId);
        return budget;
    }

    public async Task IncrementSpentAsync(string userId, string yearMonth, string category, decimal amount, CancellationToken ct = default)
    {
        var budget = await GetAsync(userId, yearMonth, category, ct);
        if (budget is null) return;
        budget.Spent += amount;
        await SaveAsync(budget, ct);
        _logger.LogInformation("Budget {Category} spent incremented by {Amount}", category, amount);
    }
}
