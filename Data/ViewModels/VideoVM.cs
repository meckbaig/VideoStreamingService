using VideoStreamingService.Models;

namespace VideoStreamingService.Data.ViewModels
{
    public class VideoVM
    {
        public FormattedVideo Video { get; set; }
        public List<int> Resolutions { get; set; }
    }
}
