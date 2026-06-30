using BudgetTracket.Core.Services;
using FluentValidation;

namespace BudgetTracket.Core.Validators;

public class CreateTransactionValidator : AbstractValidator<CreateTransactionInput>
{
    private static readonly string[] ValidTypes = ["income", "expense"];
    private static readonly string[] ValidCategories =
        ["food", "shopping", "bills", "entertainment", "transport", "health", "education", "income", "other"];

    public CreateTransactionValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty()
            .Must(t => ValidTypes.Contains(t))
            .WithMessage("Type phải là 'income' hoặc 'expense'");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Mô tả không được để trống")
            .MaximumLength(200).WithMessage("Mô tả tối đa 200 ký tự");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Số tiền phải lớn hơn 0");

        RuleFor(x => x.Category)
            .NotEmpty()
            .Must(c => ValidCategories.Contains(c))
            .WithMessage("Danh mục không hợp lệ");

        RuleFor(x => x.Date)
            .NotEmpty()
            .Matches(@"^\d{4}-\d{2}-\d{2}").WithMessage("Ngày phải có định dạng yyyy-MM-dd");
    }
}

public class UpdateTransactionValidator : AbstractValidator<UpdateTransactionInput>
{
    public UpdateTransactionValidator()
    {
        When(x => x.Description is not null, () =>
            RuleFor(x => x.Description!).MaximumLength(200));

        When(x => x.Amount.HasValue, () =>
            RuleFor(x => x.Amount!.Value).GreaterThan(0));
    }
}
