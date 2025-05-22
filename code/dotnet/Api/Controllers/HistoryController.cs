using Api.Controllers.Models;
using Api.Filters;
using Azure.Data.Tables;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/history")]
[ServiceFilter(typeof(ApiKeyAuthFilter))]
public class HistoryController : ControllerBase
{
    private readonly TableServiceClient _tableServiceClient;
  
    private const string HistoryTableName = "History";

    public HistoryController(TableServiceClient tableServiceClient)
    {
        _tableServiceClient = tableServiceClient;
    }

    [HttpGet]
    public async Task<IActionResult> GetHistory()
    {
        var tableClient = _tableServiceClient.GetTableClient(HistoryTableName);
        await tableClient.CreateIfNotExistsAsync();

        var queryResults = tableClient.QueryAsync<UsingEntity>();

        var historyViewModels = new List<HistoryViewModel>();

        await foreach (var result in queryResults)
        {
            historyViewModels.Add(new HistoryViewModel(result.Name, result.Timestamp));
        }

        return Ok(historyViewModels.OrderByDescending(x => x.Timestamp));
    }
}