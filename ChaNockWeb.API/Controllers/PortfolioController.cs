using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ChaNockWeb.API.Models;

namespace ChaNockWeb.API.Controllers;

[ApiController]
[Route("api")]
public class PortfolioController : ControllerBase
{
    private readonly string _filePath;
    private readonly IConfiguration _configuration;
    private static readonly object FileLock = new();

    public PortfolioController(IWebHostEnvironment env, IConfiguration configuration)
    {
        _filePath = Path.Combine(env.ContentRootPath, "portfolio_data.json");
        _configuration = configuration;
    }

    private List<PortfolioItem> LoadItems()
    {
        lock (FileLock)
        {
            if (!System.IO.File.Exists(_filePath))
            {
                return new List<PortfolioItem>();
            }

            try
            {
                var json = System.IO.File.ReadAllText(_filePath);
                return JsonSerializer.Deserialize<List<PortfolioItem>>(json, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                }) ?? new List<PortfolioItem>();
            }
            catch
            {
                return new List<PortfolioItem>();
            }
        }
    }

    private void SaveItems(List<PortfolioItem> items)
    {
        lock (FileLock)
        {
            var json = JsonSerializer.Serialize(items, new JsonSerializerOptions 
            { 
                WriteIndented = true 
            });
            System.IO.File.WriteAllText(_filePath, json);
        }
    }

    // Auth Login Endpoint
    [HttpPost("auth/login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var adminUser = _configuration["AdminCredentials:Username"] ?? "admin";
        var adminPass = _configuration["AdminCredentials:Password"] ?? "admin123";

        if (request.Username == adminUser && request.Password == adminPass)
        {
            return Ok(new { token = "admin-session-token-998877" });
        }

        return Unauthorized(new { message = "Invalid username or password" });
    }

    // Get Portfolio Items (Sorted by Order)
    [HttpGet("portfolio")]
    public ActionResult<IEnumerable<PortfolioItem>> GetPortfolio()
    {
        var items = LoadItems();
        return Ok(items.OrderBy(i => i.Order).ToList());
    }

    // Add New Portfolio Item
    [HttpPost("portfolio")]
    public ActionResult<PortfolioItem> AddItem([FromBody] PortfolioItem newItem)
    {
        var items = LoadItems();
        
        newItem.Id = Guid.NewGuid().ToString("n")[..8]; // Short readable random ID
        newItem.Order = items.Any() ? items.Max(i => i.Order) + 1 : 1;

        // Default type checks
        if (string.IsNullOrEmpty(newItem.Type))
        {
            newItem.Type = newItem.Src.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase) ? "video" : "image";
        }

        items.Add(newItem);
        SaveItems(items);

        return CreatedAtAction(nameof(GetPortfolio), new { id = newItem.Id }, newItem);
    }

    // Update Existing Portfolio Item
    [HttpPut("portfolio/{id}")]
    public IActionResult UpdateItem(string id, [FromBody] PortfolioItem updatedItem)
    {
        var items = LoadItems();
        var index = items.FindIndex(i => i.Id == id);

        if (index == -1)
        {
            return NotFound(new { message = "Item not found" });
        }

        var existing = items[index];
        existing.Title = updatedItem.Title;
        existing.Description = updatedItem.Description;
        existing.Category = updatedItem.Category;
        existing.Type = updatedItem.Type;
        existing.Src = updatedItem.Src;
        existing.Poster = updatedItem.Poster;
        existing.Metadata = updatedItem.Metadata;

        SaveItems(items);
        return Ok(existing);
    }

    // Delete Portfolio Item
    [HttpDelete("portfolio/{id}")]
    public IActionResult DeleteItem(string id)
    {
        var items = LoadItems();
        var item = items.Find(i => i.Id == id);

        if (item == null)
        {
            return NotFound(new { message = "Item not found" });
        }

        items.Remove(item);
        SaveItems(items);
        return Ok(new { message = "Item deleted successfully" });
    }

    // Reorder Portfolio Items (Changes layout live)
    [HttpPost("portfolio/reorder")]
    public IActionResult ReorderItems([FromBody] ReorderRequest request)
    {
        var items = LoadItems();
        var itemMap = items.ToDictionary(i => i.Id);

        var newOrderedItems = new List<PortfolioItem>();
        int orderCounter = 1;

        // Reassign orders based on request ID list
        foreach (var id in request.ItemIds)
        {
            if (itemMap.TryGetValue(id, out var item))
            {
                item.Order = orderCounter++;
                newOrderedItems.Add(item);
                itemMap.Remove(id);
            }
        }

        // Keep any remaining items that weren't in the list
        foreach (var remainingItem in itemMap.Values)
        {
            remainingItem.Order = orderCounter++;
            newOrderedItems.Add(remainingItem);
        }

        SaveItems(newOrderedItems);
        return Ok(new { message = "Reordered successfully" });
    }
}
