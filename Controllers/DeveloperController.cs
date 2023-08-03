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
    private readonly ISession _session;

    public DeveloperController(IAppConfig appConfig, IUserService userService, IHttpContextAccessor accessor)
    {
        _config = appConfig;
        _userService = userService;
        _session = accessor.HttpContext.Session;
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

        AppConfigVM appConfigVM = new AppConfigVM();
        foreach (var prop in appConfigVM.GetType().GetProperties())
        {
            try
            {
                if (prop.Name != "Item")
                    appConfigVM[prop.Name] = _config[prop.Name];
            }
            catch (TargetParameterCountException)
            {
            }
        }
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
        return _session.Get("LastPage", out string page) ? Redirect(page) : Redirect("/");
    }
}