using Azure;
using Azure.Data.Tables;

namespace Api.Controllers.Models;

public class UsingEntity : ITableEntity
{
    public UsingEntity()
    {
    }
    
    public static UsingEntity Create(string name)
    {
        return new UsingEntity
        {
            Name = name
        };
    }

    public Guid UsingId { get; init; } =  new ("3f2504e0-4f89-11d3-9a0c-0305e82c3301");
  
    public string Name { get; set; }
  
    public string PartitionKey { get; set; } = "UsingEntries";
    public string RowKey { get; set; } = new ("3f2504e0-4f89-11d3-9a0c-0305e82c3301");

    public ETag ETag { get; set; } = ETag.All;
    public DateTimeOffset? Timestamp { get; set; }
}