using Amazon.DynamoDBv2.DataModel;

namespace BudgetTracket.Core.Models;

[DynamoDBTable("BudgetTracket")]
public class UserProfile
{
    [DynamoDBHashKey("PK")]
    public string PK { get; set; } = string.Empty;   // USER#<userId>

    [DynamoDBRangeKey("SK")]
    public string SK { get; set; } = "PROFILE";

    [DynamoDBProperty]
    public string UserId { get; set; } = string.Empty;

    [DynamoDBProperty]
    public string Name { get; set; } = string.Empty;

    [DynamoDBProperty]
    public string Email { get; set; } = string.Empty;

    [DynamoDBProperty]
    public string Currency { get; set; } = "VND";

    [DynamoDBProperty]
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("O");

    public static string BuildPK(string userId) => $"USER#{userId}";
}
