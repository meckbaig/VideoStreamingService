using Microsoft.AspNetCore.Mvc;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Data.Services;
using VideoStreamingService.Models;
using VideoStreamingService.Data;

namespace VideoStreamingService.Controllers
{
	public class ChannelController : Controller
	{
		private readonly IVideoService _videoService;
        private readonly IUserService _userService;
        private readonly IUpdateDataService _updateDataService;
        private readonly IAppConfig _config;

        public ChannelController(IVideoService videoService, IUserService userService,
            IUpdateDataService updateDataService, IAppConfig appConfig)
		{
			_videoService = videoService;
			_userService = userService;
            _updateDataService = updateDataService;
            _config = appConfig;
        }

        [Route("{url}")]
        public async Task<IActionResult> Index(string url)
		{
            if (url.Length < 5) return null;
			UserChannel channelVM = new UserChannel(
                await _userService.GetChannelByUrlAsync(url),
                await _userService.GetUserByUrlAsync(User.Identity.Name),
                await _updateDataService.GetVideosAsync(_config.VideosOnPage, 1, false, 
                    new []{ VideoVisibilityEnum.Visible }, url));
            return View(channelVM);
        }

        [HttpPost]
        [Route("Subscribe/{url_sub}")]
        public async Task<string> Subscribe(string url_sub)
        {
            var url_sub_split = url_sub.Split('_');
            string url = url_sub_split[0];
            bool? sub = url_sub_split[1] == "true" ? null : true;

            await _userService.ChangeSubscription(url, User.Identity.Name, sub);

            User channel = await _userService.GetChannelByUrlAsync(url);
            string subs = channel.Subscribers.Where(s => s.Sub_Ignore == true).Count().ToString();
            return subs;
        }

        //[HttpPost]
        [Route("LoadVideos/{url_roles}")]
        public async Task<IActionResult> LoadVideos(string url, int page, string roles)
        {
            List<string> rolesSplit = roles.Remove(0, 1).Split('_').ToList();
            VideoVisibilityEnum[]? enums = new VideoVisibilityEnum[rolesSplit.Count];
            for (int i = 0; i < rolesSplit.Count; i++)
            {
                enums[i] = (VideoVisibilityEnum)Enum.Parse(typeof(VideoVisibilityEnum), rolesSplit[i]);
            }

            List<Video> videos = await _updateDataService.GetVideosAsync(_config.VideosOnPage, page,
                false, enums.Length == 0 ? null : enums, url);

			User curUser = await _userService.GetUserByUrlAsync(User.Identity.Name);

			FeedVM feedVM = new FeedVM(){ FeedType = Statics.FeedTypeEnum.Channel };
            foreach (var v in videos)
            {
                feedVM.Videos.Add(new FormattedVideo(v, curUser));
            }

            return PartialView("_Videos", feedVM);
        }
    }
}
