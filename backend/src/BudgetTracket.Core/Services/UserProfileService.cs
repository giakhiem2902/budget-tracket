using BudgetTracket.Core.Models;
using BudgetTracket.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BudgetTracket.Core.Services;

public class UserProfileService : IUserProfileService
{
    private readonly IUserProfileRepository _repo;
    private readonly ILogger<UserProfileService> _logger;

    public UserProfileService(IUserProfileRepository repo, ILogger<UserProfileService> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task<UserProfile> GetOrCreateAsync(string userId, string email, string name, CancellationToken ct = default)
    {
        var profile = await _repo.GetAsync(userId, ct);
        if (profile is not null) return profile;

        profile = new UserProfile
        {
            PK = UserProfile.BuildPK(userId),
            SK = "PROFILE",
            UserId = userId,
            Email = email,
            Name = name,
            Currency = "VND",
            CreatedAt = DateTime.UtcNow.ToString("O"),
            UpdatedAt = DateTime.UtcNow.ToString("O"),
        };

        await _repo.SaveAsync(profile, ct);
        _logger.LogInformation("Created profile for user {UserId}", userId);
        return profile;
    }

    public async Task<UserProfile> UpdateAsync(string userId, UpdateProfileInput input, CancellationToken ct = default)
    {
        var profile = await _repo.GetAsync(userId, ct)
            ?? throw new KeyNotFoundException($"Profile not found for user {userId}");

        if (input.Name is not null) profile.Name = input.Name;
        if (input.NotifyBudgetAlert.HasValue) profile.NotifyBudgetAlert = input.NotifyBudgetAlert.Value;
        if (input.NotifyMonthlyReport.HasValue) profile.NotifyMonthlyReport = input.NotifyMonthlyReport.Value;
        if (input.NotifyAnomaly.HasValue) profile.NotifyAnomaly = input.NotifyAnomaly.Value;

        return await _repo.SaveAsync(profile, ct);
    }

    public Task DeleteUserDataAsync(string userId, CancellationToken ct = default) =>
        _repo.DeleteAllUserDataAsync(userId, ct);
}
