using BudgetTracket.Core.Models;

namespace BudgetTracket.Core.Services;

public interface IUserProfileService
{
    Task<UserProfile> GetOrCreateAsync(string userId, string email, string name, CancellationToken ct = default);
    Task<UserProfile> UpdateAsync(string userId, UpdateProfileInput input, CancellationToken ct = default);
    Task DeleteUserDataAsync(string userId, CancellationToken ct = default);
}

public record UpdateProfileInput
{
    public string? Name { get; init; }
    public bool? NotifyBudgetAlert { get; init; }
    public bool? NotifyMonthlyReport { get; init; }
    public bool? NotifyAnomaly { get; init; }
}
