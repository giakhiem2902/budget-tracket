using BudgetTracket.Core.Models;

namespace BudgetTracket.Core.Repositories;

public interface IUserProfileRepository
{
    Task<UserProfile?> GetAsync(string userId, CancellationToken ct = default);
    Task<UserProfile> SaveAsync(UserProfile profile, CancellationToken ct = default);
    Task DeleteAllUserDataAsync(string userId, CancellationToken ct = default);
}
