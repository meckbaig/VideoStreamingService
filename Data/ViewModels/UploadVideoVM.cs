using VideoStreamingService.Models;
using System.Web;

namespace VideoStreamingService.Data.ViewModels
{
    public class FileUploadVM
    {
        public string Id { get; set; }
        public IFormFile File { get; set; }
    }
}
