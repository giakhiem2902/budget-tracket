using System.Text.Json;
using Amazon.Lambda.Core;
using Amazon.Lambda.SQSEvents;
using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using Microsoft.Extensions.DependencyInjection;

namespace BudgetTracket.Lambda.Functions;

public class NotificationFunction
{
    private readonly IServiceProvider _sp;
    public NotificationFunction() => _sp = Startup.BuildServiceProvider();

    // Triggered by SQS messages (budget exceeded alerts, monthly summaries)
    public async Task HandleAsync(SQSEvent sqsEvent, ILambdaContext context)
    {
        using var scope = _sp.CreateScope();
        var sns = scope.ServiceProvider.GetRequiredService<IAmazonSimpleNotificationService>();
        var topicArn = Environment.GetEnvironmentVariable("SNS_TOPIC_ARN") ?? string.Empty;

        foreach (var record in sqsEvent.Records)
        {
            try
            {
                var msg = JsonDocument.Parse(record.Body).RootElement;
                var type = msg.GetProperty("type").GetString();
                var email = msg.GetProperty("email").GetString();
                var body = msg.GetProperty("body").GetString();

                var subject = type switch
                {
                    "budget_exceeded"  => "⚠️ Budget Tracket: Vượt ngân sách",
                    "monthly_summary"  => "📊 Budget Tracket: Báo cáo tháng",
                    "anomaly_detected" => "🔔 Budget Tracket: Chi tiêu bất thường",
                    _                  => "Budget Tracket: Thông báo",
                };

                await sns.PublishAsync(new PublishRequest
                {
                    TopicArn = topicArn,
                    Subject = subject,
                    Message = body,
                });

                context.Logger.LogInformation($"Notification sent: {type} to {email}");
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Notification failed for record {record.MessageId}: {ex.Message}");
            }
        }
    }
}
