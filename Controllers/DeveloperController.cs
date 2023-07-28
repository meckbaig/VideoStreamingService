using System.Reflection;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Mvc;
using VideoStreamingService.Data;
using VideoStreamingService.Data.Services;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Controllers;

public class DeveloperController : Controller
{
    private readonly IAppConfig _config;
    private readonly IUserService _userService;

    public DeveloperController(IAppConfig appConfig, IUserService userService)
    {
        _config = appConfig;
        _userService = userService;
    }

    public async Task<IActionResult> Configuration()
    {
        Response.Cookies.Append("LastPage", Request.Headers["Referer"].ToString());
        if (User.Identity.IsAuthenticated)
        {
            User curUser = await _userService.GetUserByUrlAsync(User.Identity.Name);
            if (curUser.Role != RoleEnum.Developer)
            {
                if (string.IsNullOrEmpty(Request.Cookies["LastPage"]))
                    return Redirect("/");
                return Redirect(Request.Cookies["LastPage"]);
            }
        }
        else
        {
            if (string.IsNullOrEmpty(Request.Cookies["LastPage"]))
                return Redirect("/");
            return Redirect(Request.Cookies["LastPage"]); 
        }

        AppConfigVM appConfigVM = new AppConfigVM()
        {
            UrlChars = _config.UrlChars,
            VideosOnPage = _config.VideosOnPage,
            MaxVideoPages = _config.MaxVideoPages,
            DefaultProfilePicture = _config.DefaultProfilePicture,
            DefaultUrlLength = _config.DefaultUrlLength,
            VideoCodec = _config.VideoCodec
        };
        return View(appConfigVM);
    }

    [HttpPost]
    public IActionResult Configuration(AppConfigVM appConfigVM)
    {
        List<string> keys = new List<string>();
        List<string> values = new List<string>();
        foreach (var prop in appConfigVM.GetType().GetProperties())
        {
            try
            {
                if (prop.Name != "Item")
                {
                    keys.Add(prop.Name);
                    values.Add(appConfigVM[prop.Name].ToString());
                }
            }
            catch (Exception)
            {
            }
        }

        _config.UpdateAppSettings(keys, values);

        if (string.IsNullOrEmpty(Request.Cookies["LastPage"]))
            return Redirect("/");
        return Redirect(Request.Cookies["LastPage"]);
    }
}