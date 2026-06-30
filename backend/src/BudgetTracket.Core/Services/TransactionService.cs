using Amazon.S3;
using Amazon.S3.Model;
using BudgetTracket.Core.Models;
using BudgetTracket.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BudgetTracket.Core.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _repo;
    private readonly IBudgetRepository _budgetRepo;
    private readonly IAmazonS3 _s3;
    private readonly ILogger<TransactionService> _logger;
    private readonly string _bucketName;

    public TransactionService(
        ITransactionRepository repo,
        IBudgetRepository budgetRepo,
        IAmazonS3 s3,
        ILogger<TransactionService> logger)
    {
        _repo = repo;
        _budgetRepo = budgetRepo;
        _s3 = s3;
        _logger = logger;
        _bucketName = Environment.GetEnvironmentVariable("S3_BUCKET_RECEIPTS") ?? string.Empty;
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
            await _budgetRepo.IncrementSpentAsync(userId, yearMonth, input.Category, input.Amount, ct);
        }

        return txn;
    }

    public async Task<Transaction> UpdateAsync(string userId, string transactionId, UpdateTransactionInput input, CancellationToken ct = default)
    {
        var existing = await _repo.GetAsync(userId, transactionId, ct)
            ?? throw new KeyNotFoundException($"Transaction {transactionId} not found");

        if (input.Description is not null) existing.Description = input.Description;
        if (input.Amount.HasValue) existing.Amount = input.Amount.Value;
        if (input.Category is not null) existing.Category = input.Category;
        if (input.Date is not null) existing.Date = input.Date;
        if (input.Note is not null) existing.Note = input.Note;

        return await _repo.UpdateAsync(existing, ct);
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
}
