using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Data.Services;
using VideoStreamingService.Models;
using VideoStreamingService.Data;

namespace VideoStreamingService.Controllers	
{
	public class ChannelController : Controller
	{
        private readonly IUserService _userService;
        private readonly IUpdateDataService _updateDataService;
        private ISession _session;

        public ChannelController(IUserService userService, IUpdateDataService updateDataService, 
	         IHttpContextAccessor accessor)
		{
			_userService = userService;
            _updateDataService = updateDataService;
            _session = accessor.HttpContext.Session;
		}

        [HttpGet]
        [Route("{url}")]
        public async Task<IActionResult> Index(string url)
		{
            if (url.Length < 5) return null;
            User channel = await _userService.GetChannelByUrlAsync(url);
            if (channel == null)
            {
	            TempData["Error"] = "Аккаунт по указанному URL не найден!";
	            return _session.Get("LastPage", out string page) ? Redirect(page) : Redirect("/");
            }
			UserChannel channelVM = new UserChannel(
				channel,
                // await _userService.GetUserByUrlAsync(User.Identity.Name),
                _userService.GetUserFromSession(ref _session, User.Identity.Name)?.Id
                // await _updateDataService.GetVideosAsync(_config.VideosOnPage, 1, false, 
                //     new []{ VideoVisibilityEnum.Visible }, url)
				);
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
    }
}
