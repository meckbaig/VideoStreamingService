using System.Security.Claims;
using System.Text.Json;
using VideoStreamingService.Data.Base;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;
using Xabe.FFmpeg;

namespace VideoStreamingService.Data.Services
{
    public interface IVideoService : IEntityBaseRepository<Video>
    {
        Task <Video> CreateVideo(ClaimsPrincipal principal);
        Task<bool> SaveVideoAsync(Video video, CancellationToken ct);
        Task SaveVideoAsync(Video video, CancellationToken ct, string[] props);
        Task<bool> DeleteVideo(Video video);
        Task DeleteDirectory(string path);
		Task<Video> VideoByUrlMinInfoAsync(string url);
        Task<Video> VideoByUrlFullInfoAsync(string url);
		Task AddViewAsync(string url, ClaimsPrincipal principal);
        Task EditReaction(string videoId, string userUrl, bool reaction, bool doneUndone);
        Task<bool?> GetReaction(Video video, string userUrl);
        Task<Comment> AddComment(string videoUrl, string userUrl, string message);
		Task<bool> UpdateComment(long commentId, int userId, string message);
	}
}
