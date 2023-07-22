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

namespace VideoStreamingService.Controllers
{
    public class HomeController : Controller
    {
        private readonly IUserService _userService;
        private readonly ILogger<HomeController> _logger;
        private readonly IVideoService _videoService;

        public HomeController(IUserService userService, ILogger<HomeController> logger, IVideoService videoService)
        {
            _userService = userService;
            _logger = logger;
            _videoService = videoService;
        }

        public async Task<IActionResult> Index()
        {
            FeedVM feedVM = new FeedVM() { FeedType = Statics.FeedTypeEnum.HomePage };
            List<Video> videos = await _videoService.GetVideosAsync(50, 1, true, new [] { VideoVisibilityEnum.Visible });
            User curUser = await _userService.GetUserByUrlAsync(User.Identity.Name);

            foreach (Video video in videos)
            {
                if (video.Length > 0 && video.Resolution > 0)
				{
                    feedVM.Videos.Add(new FormattedVideo(video, curUser));
				}
            }
            return View(feedVM);
        }

		public async Task<IActionResult> Privacy()
		{
			return View();
		}

		public async Task<IActionResult> Subscriptions()
		{
            if (!User.Identity.IsAuthenticated)
                return Redirect("/Home/Index");
            SubscriptionsVM subsVM = new SubscriptionsVM(
                await _userService.GetSubscriptions(User.Identity.Name),
                await _userService.GetUserByUrlAsync(User.Identity.Name));

            return View(subsVM);
		}

		public async Task<IActionResult> History()
		{
			if (!User.Identity.IsAuthenticated)
				return Redirect("/Home/Index");
			FeedVM feedVM = new FeedVM()
			{
				Videos = await _videoService.GetViewsHistory(Statics.VideosOnPage, 1, User.Identity.Name),
				FeedType = Statics.FeedTypeEnum.History
			};
			return View(feedVM);
		}

		public async Task<IActionResult> Search()
        {
            string s = "";
            if (!String.IsNullOrEmpty(HttpContext.Request.Query[nameof(s)]))
                s = HttpContext.Request.Query[nameof(s)].ToString().Replace('_', ' ');
            TempData["SearchString"] = s;
            SearchVM searchVM = new SearchVM();
			searchVM.SearchElements.AddRange(await _videoService.SearchVideosAsync(s, User.Identity.Name));
			searchVM.SearchElements.AddRange(await _userService.SearchUsersAsync(s, User.Identity.Name));
			searchVM.SearchElements = searchVM.SearchElements.OrderByDescending(se => se.DiceCoefficient).ThenByDescending(se => se.MaxResults).ToList();
			return View(searchVM);
		}

		public async Task<IActionResult> Library()
		{
			if (!User.Identity.IsAuthenticated)
				return Redirect("/Home/Index");
			List<Video> videos = await _videoService.GetLastVideos(1, 0, User.Identity.Name);
			FeedVM feedVM = new FeedVM() { FeedType = Statics.FeedTypeEnum.Library };

			foreach (Video video in videos)
			{
				feedVM.Videos.Add(
					new FormattedVideo(video,
						await _userService.GetUserByUrlAsync(User.Identity.Name)));
			}

			return View(feedVM);
		}

		[HttpPost]
		public async Task<IActionResult> AppendToLibray([FromBody] JsonDocument data)
		{
			int daysTake = Convert.ToInt32(data.RootElement.GetProperty("daysTake").ToString());
			int daysSkip = Convert.ToInt32(data.RootElement.GetProperty("daysSkip").ToString());
			List<Video> videos = await _videoService.GetLastVideos(daysTake, daysSkip, User.Identity.Name);
			FeedVM feedVM = new FeedVM() { FeedType = Statics.FeedTypeEnum.Library };

			foreach (Video video in videos)
			{
				feedVM.Videos.Add(
					new FormattedVideo(video,
						await _userService.GetUserByUrlAsync(User.Identity.Name)));
			}
			return PartialView("_Videos", feedVM);
		}

		//[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
		//public async Task<IActionResult> Error()
		//{
		//    return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
		//}
	}
}