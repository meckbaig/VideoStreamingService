using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;
using VideoStreamingService.Data;
using VideoStreamingService.Data.Services;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;
using System;
using System.Text.Json;
using Microsoft.VisualBasic;

namespace VideoStreamingService.Controllers
{
    public class HomeController : Controller
    {
        private readonly IUserService _userService;
        private readonly ILogger<HomeController> _logger;
        private readonly IVideoService _videoService;
        private readonly IUpdateDataService _updateDataService;
        private readonly IAppConfig _config;

        public HomeController(IUserService userService, ILogger<HomeController> logger, IVideoService videoService,
            IUpdateDataService updateDataService, IAppConfig appConfig)
        {
            _userService = userService;
            _logger = logger;
            _videoService = videoService;
            _updateDataService = updateDataService;
            _config = appConfig;
        }

        public async Task<IActionResult> Index()
        {
            FeedVM feedVM = new FeedVM()
            {
                FeedType = Statics.FeedTypeEnum.HomePage,
                Videos = await _updateDataService.GetRandomVideos(_config.VideosOnPage, 1, User.Identity.Name)
            };

            return View(feedVM);
        }

        public async Task<IActionResult> Privacy()
        {
            return View();
        }

        public async Task<IActionResult> Subscriptions()
        {
            if (!User.Identity.IsAuthenticated)
                return Redirect("/");
            SubscriptionsVM subsVM = new SubscriptionsVM(
                await _userService.GetSubscriptions(User.Identity.Name),
                await _userService.GetUserByUrlAsync(User.Identity.Name));

            return View(subsVM);
        }

        public async Task<IActionResult> History()
        {
            if (!User.Identity.IsAuthenticated)
                return Redirect("/");
            FeedVM feedVM = new FeedVM()
            {
                Videos = await _updateDataService.GetVideosHistory(_config.VideosOnPage, 1, User.Identity.Name),
                FeedType = Statics.FeedTypeEnum.History
            };
            return View(feedVM);
        }

        [HttpPost]
        public async Task<IActionResult> LoadVideos([FromBody] JsonDocument data)
        {
            Enum.TryParse(data.RootElement.GetProperty("feedType").ToString(), out Statics.FeedTypeEnum feedType);
            int nextPage = Convert.ToInt32(data.RootElement.GetProperty(nameof(nextPage)).ToString());
            
            List<FormattedVideo> videos;
            try
            {
                switch (feedType)
                {
                    case Statics.FeedTypeEnum.History:
                        videos = await _updateDataService.GetVideosHistory(_config.VideosOnPage, nextPage,
                            User.Identity.Name);
                        break;
                    case Statics.FeedTypeEnum.Library:
                        int daysTake = Convert.ToInt32(data.RootElement.GetProperty("daysTake").ToString());
                        int daysSkip = Convert.ToInt32(data.RootElement.GetProperty("daysSkip").ToString());
                        videos = await _updateDataService.GetLastVideos(daysTake, daysSkip,
                            _config.VideosOnPage, nextPage, User.Identity.Name);
                        break;
                    case Statics.FeedTypeEnum.HomePage:
                        List<string> urlsList = (JsonSerializer
                            .Deserialize<string[]>(data.RootElement.GetProperty("urlsArr")) ?? Array.Empty<string>()).ToList();
                        videos = await _updateDataService.GetRandomVideos(_config.VideosOnPage, nextPage,
                            User.Identity.Name, urlsList);
                        break;
                    case Statics.FeedTypeEnum.Search:
                        string searchString = data.RootElement.GetProperty(nameof(searchString)).ToString();
                        SearchVM searchVM = await _updateDataService.GetSearchResults(
                            _config.VideosOnPage / 2, nextPage, searchString, User.Identity.Name);
                        ViewData["FeedType"] = Statics.FeedTypeEnum.Search.ToString();
                        return PartialView("_SearchResults", searchVM);
                    case Statics.FeedTypeEnum.Channel:
                        string[] visibilitiesStringsArr = (JsonSerializer.Deserialize<string[]>(
                            data.RootElement.GetProperty("visibilitiesArr")) ?? Array.Empty<string>()).ToArray();
                        string channelUrl = data.RootElement.GetProperty(nameof(channelUrl)).ToString();
                        VideoVisibilityEnum[] visibilitiesArr = new VideoVisibilityEnum[visibilitiesStringsArr.Length];
                        for (int i = 0; i < visibilitiesStringsArr.Length; i++)
                        {
                            visibilitiesArr[i] = (VideoVisibilityEnum)Enum.Parse(typeof(VideoVisibilityEnum), visibilitiesStringsArr[i]);
                        }
                        User curUser = await _userService.GetUserByUrlAsync(User.Identity.Name);
                        videos = _updateDataService.GetVideosAsync(_config.VideosOnPage, nextPage,
                            false, visibilitiesArr.Length == 0 ? null : visibilitiesArr, channelUrl)
                            .Result.ToFormattedVideos(curUser);
                        break;
                    default:
                        videos = new List<FormattedVideo>();
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                throw;
            }

            FeedVM feedVM = new FeedVM()
            {
                Videos = videos,
                FeedType = feedType
            };
            return PartialView("_Videos", feedVM);
        }

        public async Task<IActionResult> Search()
        {
            string searchString = "";
            if (!String.IsNullOrEmpty(HttpContext.Request.Query[nameof(searchString)]))
                searchString = HttpContext.Request.Query[nameof(searchString)].ToString().Replace('_', ' ');
            TempData["SearchString"] = searchString;
            SearchVM searchVM =
                await _updateDataService.GetSearchResults(_config.VideosOnPage / 2, 1, searchString,
                    User.Identity.Name);

            return View(searchVM);
        }

        public async Task<IActionResult> Library()
        {
            if (!User.Identity.IsAuthenticated)
                return Redirect("/");
            List<FormattedVideo> videos =
                await _updateDataService.GetLastVideos(1, 0, _config.VideosOnPage, 1, User.Identity.Name);
            FeedVM feedVM = new FeedVM()
            {
                FeedType = Statics.FeedTypeEnum.Library,
                Videos = videos,
            };
            return View(feedVM);
        }

        [HttpPost]
        public async Task<IActionResult> AppendToLibrary([FromBody] JsonDocument data)
        {
            int daysTake = Convert.ToInt32(data.RootElement.GetProperty("daysTake").ToString());
            int daysSkip = Convert.ToInt32(data.RootElement.GetProperty("daysSkip").ToString());
            List<FormattedVideo> videos =
                await _updateDataService.GetLastVideos(daysTake, daysSkip, _config.VideosOnPage, 1, User.Identity.Name);
            FeedVM feedVM = new FeedVM()
            {
                FeedType = Statics.FeedTypeEnum.Library,
                Videos = videos,
            };
            return PartialView("_Videos", feedVM);
        }

        //[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        //public async Task<IActionResult> Error()
        //{
        //    return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        //}
    }
}