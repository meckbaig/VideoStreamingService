using System.Security.Claims;
using System.Text.Json;
using VideoStreamingService.Data.Base;
using VideoStreamingService.Models;
using Xabe.FFmpeg;

namespace VideoStreamingService.Data.Services
{
    public interface IVideoService : IEntityBaseRepository<Video>
    {
        Task <Video> CreateVideo(ClaimsPrincipal principal);
        Task SaveVideoAsync(Video video, CancellationToken ct);
        Task SaveVideoAsync(Video video, CancellationToken ct, string[] props);
        Task<bool> DeleteVideo(Video video);
        Task DeleteDirectory(string path);
        Task<List<Video>> GetVideosAsync(int amount, int page, bool? shuffle = false, VideoVisibilityEnum[]? enums = null, string? userUrl = null);

        Task<Video> VideoByIdAsync(string id);
        Task AddViewAsync(string id, ClaimsPrincipal principal);
        Task EditReaction(string videoId, string userUrl, bool reaction, bool doneUndone);
        Task<bool?> GetReaction(Video video, string userUrl);

	}
}
