using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.S3;
using Amazon.BedrockRuntime;
using Amazon.SimpleNotificationService;
using BudgetTracket.Core.Repositories;
using BudgetTracket.Core.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace BudgetTracket.Lambda;

public static class Startup
{
    public static IServiceProvider BuildServiceProvider()
    {
        var services = new ServiceCollection();

        // AWS Clients (Lambda role provides credentials automatically)
        services.AddSingleton<IAmazonDynamoDB, AmazonDynamoDBClient>();
        services.AddSingleton<IDynamoDBContext>(sp =>
            new DynamoDBContext(sp.GetRequiredService<IAmazonDynamoDB>()));
        services.AddSingleton<IAmazonS3, AmazonS3Client>();
        services.AddSingleton<IAmazonBedrockRuntime, AmazonBedrockRuntimeClient>();
        services.AddSingleton<IAmazonSimpleNotificationService, AmazonSimpleNotificationServiceClient>();

        // Repositories
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IBudgetRepository, BudgetRepository>();

        // Services
        services.AddScoped<ITransactionService, TransactionService>();
        services.AddScoped<IBudgetService, BudgetService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IAiService, AiService>();

        // Logging (CloudWatch via stdout)
        services.AddLogging(b => b.AddConsole().SetMinimumLevel(LogLevel.Information));


        return services.BuildServiceProvider();
    }
}
