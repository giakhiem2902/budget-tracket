using System.Text.Json;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.SQS;
using Amazon.SQS.Model;
using BudgetTracket.Core.Models;
using BudgetTracket.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BudgetTracket.Core.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _repo;
    private readonly IBudgetRepository _budgetRepo;
    private readonly IAmazonS3 _s3;
    private readonly IAmazonSQS _sqs;
    private readonly ILogger<TransactionService> _logger;
    private readonly string _bucketName;
    private readonly string _sqsQueueUrl;

    public TransactionService(
        ITransactionRepository repo,
        IBudgetRepository budgetRepo,
        IAmazonS3 s3,
        IAmazonSQS sqs,
        ILogger<TransactionService> logger)
    {
        _repo = repo;
        _budgetRepo = budgetRepo;
        _s3 = s3;
        _sqs = sqs;
        _logger = logger;
        _bucketName = Environment.GetEnvironmentVariable("S3_BUCKET_RECEIPTS") ?? string.Empty;
        _sqsQueueUrl = Environment.GetEnvironmentVariable("SQS_QUEUE_URL") ?? string.Empty;
    }

    public Task<PagedResult<Transaction>> ListAsync(string userId, TransactionFilter filter, CancellationToken ct = default) =>
        _repo.ListAsync(userId, filter, ct);

    public async Task<Transaction> CreateAsync(string userId, CreateTransactionInput input, CancellationToken ct = default)
    {
        var id = Guid.NewGuid().ToString("N");
        var date = DateTime.TryParse(input.Date, out var d) ? d : DateTime.UtcNow;

        var txn = new Transaction
        {
            PK = Transaction.BuildPK(userId),
            SK = Transaction.BuildSK(id, date),
            UserId = userId,
            Type = input.Type,
            Description = input.Description,
            Amount = input.Amount,
            Category = input.Category,
            Date = input.Date,
            Note = input.Note,
        };

        await _repo.CreateAsync(txn, ct);

        if (input.Type == "expense")
        {
            var yearMonth = date.ToString("yyyy-MM");
            var updatedBudget = await _budgetRepo.IncrementSpentAsync(userId, yearMonth, input.Category, input.Amount, ct);
            await PublishBudgetAlertIfExceededAsync(userId, updatedBudget, yearMonth, ct);
        }

        return txn;
    }

    public async Task<Transaction> UpdateAsync(string userId, string transactionId, UpdateTransactionInput input, CancellationToken ct = default)
    {
        var existing = await _repo.GetAsync(userId, transactionId, ct)
            ?? throw new KeyNotFoundException($"Transaction {transactionId} not found");

        // Capture old values before mutation
        var oldAmount = existing.Amount;
        var oldCategory = existing.Category;
        var oldDate = existing.Date;
        var wasExpense = existing.Type == "expense";

        if (input.Description is not null) existing.Description = input.Description;
        if (input.Amount.HasValue)  existing.Amount = input.Amount.Value;
        if (input.Category is not null) existing.Category = input.Category;
        if (input.Date is not null) existing.Date = input.Date;
        if (input.Note is not null) existing.Note = input.Note;

        var result = await _repo.UpdateAsync(existing, ct);

        // Sync budget spent when an expense changes amount or category
        if (wasExpense && (input.Amount.HasValue || input.Category is not null))
        {
            var yearMonth = DateTime.TryParse(oldDate, out var d) ? d.ToString("yyyy-MM") : DateTime.UtcNow.ToString("yyyy-MM");

            if (input.Category is not null && oldCategory != existing.Category)
            {
                // Category changed: reverse old category, apply new category
                await _budgetRepo.IncrementSpentAsync(userId, yearMonth, oldCategory, -oldAmount, ct);
                var updatedBudget = await _budgetRepo.IncrementSpentAsync(userId, yearMonth, existing.Category, existing.Amount, ct);
                await PublishBudgetAlertIfExceededAsync(userId, updatedBudget, yearMonth, ct);
            }
            else if (input.Amount.HasValue)
            {
                // Same category, only amount changed: adjust the delta
                var delta = existing.Amount - oldAmount;
                if (delta != 0)
                {
                    var updatedBudget = await _budgetRepo.IncrementSpentAsync(userId, yearMonth, existing.Category, delta, ct);
                    if (delta > 0)
                        await PublishBudgetAlertIfExceededAsync(userId, updatedBudget, yearMonth, ct);
                }
            }
        }

        return result;
    }

    public Task DeleteAsync(string userId, string transactionId, CancellationToken ct = default) =>
        _repo.DeleteAsync(userId, transactionId, ct);

    public async Task<(string UploadUrl, string ViewUrl)> GetReceiptUploadUrlAsync(
        string userId, string transactionId, string contentType, CancellationToken ct = default)
    {
        var key = $"receipts/{userId}/{transactionId}/{Guid.NewGuid():N}";

        var uploadUrl = _s3.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Verb = HttpVerb.PUT,
            ContentType = contentType,
            Expires = DateTime.UtcNow.AddMinutes(15),
        });

        var viewUrl = _s3.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddDays(7),
        });

        var existing = await _repo.GetAsync(userId, transactionId, ct);
        if (existing is not null)
        {
            existing.ReceiptUrl = viewUrl;
            await _repo.UpdateAsync(existing, ct);
        }

        return (uploadUrl, viewUrl);
    }

    private async Task PublishBudgetAlertIfExceededAsync(
        string userId, Budget? budget, string yearMonth, CancellationToken ct)
    {
        if (budget is null || budget.Spent < budget.Limit || string.IsNullOrEmpty(_sqsQueueUrl))
            return;

        var percentage = budget.Limit > 0 ? (int)(budget.Spent / budget.Limit * 100) : 0;
        var message = JsonSerializer.Serialize(new
        {
            type = "budget_exceeded",
            userId,
            email = userId,
            body = $"⚠️ Bạn đã vượt ngân sách danh mục '{budget.Category}' tháng {yearMonth}.\n" +
                   $"Đã chi: {budget.Spent:N0}₫ / Giới hạn: {budget.Limit:N0}₫ ({percentage}%)"
        });

        await _sqs.SendMessageAsync(new SendMessageRequest
        {
            QueueUrl = _sqsQueueUrl,
            MessageBody = message,
        }, ct);

        _logger.LogWarning("Budget exceeded alert sent for user {UserId}, category {Category} ({Percentage}%)",
            userId, budget.Category, percentage);
    }
}
