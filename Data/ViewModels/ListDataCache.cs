namespace VideoStreamingService.Data.ViewModels;

public class ListDataCache
{
    public List<object> Objects { get; set; } = new List<object>();
    public int PagesFrom { get; set; }
    public int PagesTo { get; set; }
}