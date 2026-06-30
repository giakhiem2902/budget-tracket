namespace BudgetTracket.Core.Models;

public record ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Error { get; init; }
    public string? Message { get; init; }

    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string error) =>
        new() { Success = false, Error = error };
}

public record PagedResult<T>
{
    public IEnumerable<T> Items { get; init; } = [];
    public int Total { get; init; }
    public string? NextPageToken { get; init; }
}
