using Api.Controllers.Models;
using Api.Filters;
using Azure;
using Azure.Data.Tables;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Api.Controllers;
        
[ApiController]
[Route("api/using")]
[ServiceFilter(typeof(ApiKeyAuthFilter))]
public class UsingController : ControllerBase
{
    private readonly TableServiceClient _tableServiceClient;
  
    private const string TableName = "Using";

    public UsingController(TableServiceClient tableServiceClient)
    {
        _tableServiceClient = tableServiceClient;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetUsing()
    {
        var tableClient = _tableServiceClient.GetTableClient(TableName);

        await tableClient.CreateIfNotExistsAsync();
        
        var entity = await GetUsingEntity(tableClient);

        if (entity == null)
        {
            entity = UsingEntity.Create("No one");
            await tableClient.AddEntityAsync(entity);
        }

        return Ok(new UsingRecord(entity.Name));
    }

    

    [HttpPost]
    public async Task<IActionResult> PostUsingRecord([FromBody] UpdateUsingRequest request)
    {
        var tableClient = _tableServiceClient.GetTableClient(TableName);
        
        await tableClient.CreateIfNotExistsAsync();
        
        var entity = await GetUsingEntity(tableClient);

        if (entity == null)
        {
            entity = UsingEntity.Create("No one");
            await tableClient.AddEntityAsync(entity);
        }
        else
        {
            entity.Name = request.Name;
            await tableClient.UpdateEntityAsync(entity, ETag.All, TableUpdateMode.Replace);
        }
        
        Response.Headers.Append("Location", $"/api/using");

        return CreatedAtAction(nameof(GetUsing), null);
    }
    
    private async Task<UsingEntity?> GetUsingEntity(TableClient tableClient)
    {
        var queryResults = tableClient.QueryAsync<UsingEntity>();

        UsingEntity? entity = null;
        await foreach (var result in queryResults)
        {
            entity = result;
            break; // Stop after finding the first match
        }

        return entity;
    }

    public class UsingRecordExample : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type == typeof(UsingRecord))
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("Lister")
                };
        }
    }
}