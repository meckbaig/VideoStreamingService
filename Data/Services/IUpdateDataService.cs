using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.Services
{
    public interface IUpdateDataService
    {
        Task<SearchVM> GetSearchResults(int amount, int page, string searchString, string curUserUrl);
        Task<List<FormattedVideo>> GetVideosHistory(int amount, int page, string curUserUrl);
        Task<List<FormattedVideo>> GetLastVideos(int daysTake, int daysSkip, int amount, int page, string curUserUrl);
        Task<List<FormattedVideo>> GetRandomVideos(int amount, int page, string curUserUrl, List<string>? urlsList = null);

        Task<List<FormattedVideo>> GetChannelVideos(int amount, int page,
            VideoVisibilityEnum[] visibilitiesArr, string curUserUrl, string channelUrl);
        Task<List<Video>> GetVideosAsync(int? amount = null, int? page = null, bool? shuffle = null,
            VideoVisibilityEnum[]? enums = null, string? userUrl = null, List<string>? urlsList = null);
    }
}