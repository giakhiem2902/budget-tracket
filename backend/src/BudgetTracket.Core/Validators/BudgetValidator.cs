using FluentValidation;

namespace BudgetTracket.Core.Validators;

public record CreateBudgetRequest(string Category, decimal Limit);

public class CreateBudgetValidator : AbstractValidator<CreateBudgetRequest>
{
    private static readonly string[] ValidCategories =
        ["food", "shopping", "bills", "entertainment", "transport", "health", "education", "other"];

    public CreateBudgetValidator()
    {
        RuleFor(x => x.Category)
            .NotEmpty()
            .Must(c => ValidCategories.Contains(c))
            .WithMessage("Danh mục không hợp lệ");

        RuleFor(x => x.Limit)
            .GreaterThan(0).WithMessage("Hạn mức phải lớn hơn 0");
    }
}
