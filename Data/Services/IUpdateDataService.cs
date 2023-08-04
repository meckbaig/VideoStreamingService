using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.Services
{
    public interface IUpdateDataService
    {
        Task<SearchVM> GetSearchResults(int amount, int page, string searchString, string curUserUrl);
        Task<List<FormattedVideo>> GetVideosHistory(int amount, int page, User curUser);
        Task<List<FormattedVideo>> GetLastVideos(int daysTake, int daysSkip, int amount, int page, User curUser);
        Task<List<FormattedVideo>> GetRandomVideos(int amount, int page, User curUser, List<string>? urlsList = null);
        Task<List<FormattedVideo>> GetChannelVideos(int amount, int page,
            VideoVisibilityEnum[] visibilitiesArr, User curUser, string channelUrl);
        Task<List<Video>> GetVideosAsync(int? amount = null, int? page = null, bool? shuffle = null,
            VideoVisibilityEnum[]? enums = null, string? userUrl = null, List<string>? urlsList = null, 
            int? pagesInChunk = null);
    }
}