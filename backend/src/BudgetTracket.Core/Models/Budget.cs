using Amazon.DynamoDBv2.DataModel;

namespace BudgetTracket.Core.Models;

[DynamoDBTable("BudgetTracket")]
public class Budget
{
    [DynamoDBHashKey("PK")]
    public string PK { get; set; } = string.Empty;   // USER#<userId>

    [DynamoDBRangeKey("SK")]
    public string SK { get; set; } = string.Empty;   // BUDGET#<year-month>#<category>

    [DynamoDBProperty]
    public string UserId { get; set; } = string.Empty;

    [DynamoDBProperty]
    public string Category { get; set; } = string.Empty;

    [DynamoDBProperty]
    public string YearMonth { get; set; } = string.Empty;  // e.g. 2026-06

    [DynamoDBProperty]
    public decimal Limit { get; set; }

    [DynamoDBProperty]
    public decimal Spent { get; set; }

    [DynamoDBProperty]
    public string UpdatedAt { get; set; } = DateTime.UtcNow.ToString("O");

    public static string BuildPK(string userId) => $"USER#{userId}";
    public static string BuildSK(string yearMonth, string category) =>
        $"BUDGET#{yearMonth}#{category}";
}
