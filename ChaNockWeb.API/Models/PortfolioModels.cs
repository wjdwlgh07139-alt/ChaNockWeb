namespace ChaNockWeb.API.Models;

public class ExifMetadata
{
    public string Camera { get; set; } = string.Empty;
    public string Lens { get; set; } = string.Empty;
    public string Aperture { get; set; } = string.Empty;
    public string ShutterSpeed { get; set; } = string.Empty;
    public string Iso { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
}

public class PortfolioItem
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "image" or "video"
    public string Src { get; set; } = string.Empty;
    public string? Poster { get; set; }
    public int Order { get; set; }
    public ExifMetadata Metadata { get; set; } = new();
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class ReorderRequest
{
    public List<string> ItemIds { get; set; } = new();
}
