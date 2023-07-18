using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;
using Xabe.FFmpeg;

namespace VideoStreamingService.Data.Services
{
    public interface IVideoProcessingService
    {
        Task<Video> AddVideoInfo(Video video, string webroot);
        Task ConvertVideo(string input, CancellationToken ct);
        Task ExecutePreviews(IMediaInfo mediaInfo, string input, CancellationToken ct);
        Task<short> GetMaxResolution(string path);
        Task CreateThumbnail(string folderPath, FileUploadVM video);
    }
}