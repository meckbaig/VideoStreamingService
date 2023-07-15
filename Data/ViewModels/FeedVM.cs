using VideoStreamingService.Models;

namespace VideoStreamingService.Data.ViewModels
{
    public class FeedVM
    {
        public List<FormattedVideo> Videos { get; set; } = new List<FormattedVideo>();
    }
}
