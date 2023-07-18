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
            FeedVM feedVM = new FeedVM();
            List<Video> videos = await _videoService.GetVideosAsync(50, 1, true, new [] { VideoVisibilityEnum.Visible });
            User curUser = await _userService.GetByUrlUserAsync(User.Identity.Name);

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

        

        //[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        //public async Task<IActionResult> Error()
        //{
        //    return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        //}
    }
}