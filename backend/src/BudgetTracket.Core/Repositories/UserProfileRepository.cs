using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.Model;
using BudgetTracket.Core.Models;
using Microsoft.Extensions.Logging;

namespace BudgetTracket.Core.Repositories;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly IDynamoDBContext _db;
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly ILogger<UserProfileRepository> _logger;
    private static readonly string TableName =
        Environment.GetEnvironmentVariable("DYNAMODB_TABLE") ?? "BudgetTracket-dev";

    public UserProfileRepository(IDynamoDBContext db, IAmazonDynamoDB dynamoDb, ILogger<UserProfileRepository> logger)
    {
        _db = db;
        _dynamoDb = dynamoDb;
        _logger = logger;
    }

    public async Task<UserProfile?> GetAsync(string userId, CancellationToken ct = default)
    {
        return await _db.LoadAsync<UserProfile>(
            UserProfile.BuildPK(userId), "PROFILE",
            new DynamoDBOperationConfig { OverrideTableName = TableName },
            ct
        );
    }

    public async Task<UserProfile> SaveAsync(UserProfile profile, CancellationToken ct = default)
    {
        profile.UpdatedAt = DateTime.UtcNow.ToString("O");
        await _db.SaveAsync(profile, new DynamoDBOperationConfig { OverrideTableName = TableName }, ct);
        return profile;
    }

    public async Task DeleteAllUserDataAsync(string userId, CancellationToken ct = default)
    {
        var pk = UserProfile.BuildPK(userId);
        string? lastKey = null;

        do
        {
            var request = new QueryRequest
            {
                TableName = TableName,
                KeyConditionExpression = "PK = :pk",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":pk"] = new AttributeValue { S = pk }
                },
                ProjectionExpression = "PK, SK",
                ExclusiveStartKey = lastKey is null ? null : new Dictionary<string, AttributeValue>
                {
                    ["PK"] = new AttributeValue { S = pk },
                    ["SK"] = new AttributeValue { S = lastKey }
                }
            };

            var response = await _dynamoDb.QueryAsync(request, ct);
            if (response.Items.Count == 0) break;

            // Batch delete in chunks of 25 (DynamoDB limit)
            foreach (var chunk in response.Items.Chunk(25))
            {
                var deleteRequests = chunk.Select(item => new WriteRequest
                {
                    DeleteRequest = new DeleteRequest
                    {
                        Key = new Dictionary<string, AttributeValue>
                        {
                            ["PK"] = item["PK"],
                            ["SK"] = item["SK"]
                        }
                    }
                }).ToList();

                await _dynamoDb.BatchWriteItemAsync(new BatchWriteItemRequest
                {
                    RequestItems = new Dictionary<string, List<WriteRequest>>
                    {
                        [TableName] = deleteRequests
                    }
                }, ct);
            }

            lastKey = response.LastEvaluatedKey?.GetValueOrDefault("SK")?.S;
        }
        while (lastKey is not null);

        _logger.LogInformation("Deleted all data for user {UserId}", userId);
    }
}
