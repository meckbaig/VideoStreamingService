using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using VideoStreamingService.Data.Services;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Controllers
{
    public class UserController : Controller
    {
        private readonly IUserService _userService;
        private readonly ISession _session;

        public UserController(IUserService userService, IHttpContextAccessor accessor)
        {
            _userService = userService;
            _session = accessor.HttpContext.Session;
        }

        // [HttpPost]
        // public async Task<string> GetUserName()
        // {
        //     if (User.Identity.IsAuthenticated)
        //     {
        //         string name = _userService.NameByUrl(User.Identity.Name);
        //         if (name != null)
				    // ViewData["UserName"] = name;
        //         else
			     //    await HttpContext.SignOutAsync();
        //         return name;
        //     }
        //     return null;
        // }

        public async Task<IActionResult> Logout()
        {
			await HttpContext.SignOutAsync();
            _session.Remove("CurUser");
            return _session.Get("LastPage", out string page) ? Redirect(page) : Redirect("/");
        }

        public IActionResult Login()
        {
            Response.Cookies.Append("LastPage", Request.Headers["Referer"].ToString());
            return View(new LoginVM());
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginVM logVM)
        {
            if (!ModelState.IsValid) return View(logVM);

            User user = await _userService.GetUserByEmailAsync(logVM.Email);
            if (user == null)
            {
                TempData["Error"] = "Электронная почта не зарегистрирована";
                return View(logVM);
            }
            if (!_userService.PasswordMatches(user, logVM.Password))
            {
                TempData["Error"] = "Неверный пароль";
                return View(logVM);
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Url),
                new Claim(ClaimTypes.Role, user.Role.Name)
            };
            ClaimsIdentity claimsIdentity = new ClaimsIdentity(claims, "Cookies");
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity));
            Response.Cookies.Append("UserName", user.Name);
            Response.Cookies.Append("Theme", user.Theme);
            _session.Remove("CurUser");
            if (string.IsNullOrEmpty(Request.Cookies["LastPage"]))
                return Redirect("/");
            return Redirect(Request.Cookies["LastPage"]);
        }

        public IActionResult Registration() => View(new RegistrationVM());

        [HttpPost]
        public async Task<IActionResult> Registration(RegistrationVM regVM)
        {
            if (!ModelState.IsValid) return View(regVM);

            User user = await _userService.GetUserByEmailAsync(regVM.Email);
            if (user != null)
            {
                TempData["Error"] = "Электронная почта уже используется";
                return View(regVM);
            }
            User newUser = new User
            {
                Email = regVM.Email,
                Name = regVM.Name
            };
            await _userService.CreateUserAsync(newUser, regVM.Password);
            user = await _userService.GetUserByEmailAsync(newUser.Email);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Url)
            };
            ClaimsIdentity claimsIdentity = new ClaimsIdentity(claims, "Cookies");
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity));
            _session.Remove("CurUser");
            return _session.Get("LastPage", out string page) ? Redirect(page) : Redirect("/");
        }

        [HttpGet]
        public async Task<IActionResult> Edit()
        {
            User user = await _userService.GetUserByUrlAsync(User.Identity.Name);
            return View(new EditUserVM(user));
        }

        [HttpPost]
        public async Task<IActionResult> Edit(EditUserVM editUserVM)
        {
            if (!ModelState.IsValid)
                return View(editUserVM);
            User user = await _userService.SaveUserAsync(editUserVM, new[] { "Name", "Url" });
            await HttpContext.SignOutAsync();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Url),
                new Claim(ClaimTypes.Role, user.Role.Name)
            };
            ClaimsIdentity claimsIdentity = new ClaimsIdentity(claims, "Cookies");
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity));
            return _session.Get("LastPage", out string page) ? Redirect(page) : Redirect("/");
        }

        public async Task<IActionResult> CheckUrl(string url)
        {
            User user = await _userService.GetUserByUrlAsync(url);
            if (user != null && user.Url != User.Identity.Name)
                return Json(false);
            return Json(true);
        }

        [HttpPost]
        public async Task SaveTheme([FromBody] JsonDocument data)
		{
			string url = data.RootElement.GetProperty("Url").ToString();
			string theme = data.RootElement.GetProperty("Theme").ToString();
            await _userService.SaveTheme(url, theme);
            Response.Cookies.Append("Theme", theme);
        }
	}
}
