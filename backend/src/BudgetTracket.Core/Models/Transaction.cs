using Amazon.DynamoDBv2.DataModel;

namespace BudgetTracket.Core.Models;

[DynamoDBTable("BudgetTracket")]
public class Transaction
{
    [DynamoDBHashKey("PK")]
    public string PK { get; set; } = string.Empty;   // USER#<userId>

    [DynamoDBRangeKey("SK")]
    public string SK { get; set; } = string.Empty;   // TXN#<timestamp>#<id>

    [DynamoDBIgnore]
    public string Id => SK.Split('#').LastOrDefault() ?? string.Empty;

    [DynamoDBProperty]
    public string UserId { get; set; } = string.Empty;

    [DynamoDBProperty]
    public string Type { get; set; } = "expense";     // income | expense

    [DynamoDBProperty]
    public string Description { get; set; } = string.Empty;

    [DynamoDBProperty]
    public decimal Amount { get; set; }

    [DynamoDBProperty]
    public string Category { get; set; } = "other";

    [DynamoDBProperty]
    public string Date { get; set; } = string.Empty;  // ISO 8601

    [DynamoDBProperty]
    public string? Note { get; set; }

    [DynamoDBProperty]
    public string? ReceiptUrl { get; set; }

    [DynamoDBProperty]
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("O");

    public static string BuildPK(string userId) => $"USER#{userId}";
    public static string BuildSK(string id, DateTime date) =>
        $"TXN#{date:yyyyMMddHHmmss}#{id}";
}
