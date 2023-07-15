using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync();
            if (string.IsNullOrEmpty(Request.Cookies["LastPage"]))
                return Redirect("/Home/Index");
            return Redirect(Request.Cookies["LastPage"]);
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

            User user = await _userService.FindByEmailAsync(logVM.Email);
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

            if (string.IsNullOrEmpty(Request.Cookies["LastPage"]))
                return Redirect("/Home/Index");
            return Redirect(Request.Cookies["LastPage"]);
        }

        public IActionResult Registration() => View(new RegistrationVM());

        [HttpPost]
        public async Task<IActionResult> Registration(RegistrationVM regVM)
        {
            if (!ModelState.IsValid) return View(regVM);

            User user = await _userService.FindByEmailAsync(regVM.Email);
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
            await _userService.CreateUser(newUser, regVM.Password);
            user = await _userService.FindByEmailAsync(newUser.Email);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Url)
            };
            ClaimsIdentity claimsIdentity = new ClaimsIdentity(claims, "Cookies");
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity));

            return Redirect(Request.Cookies["LastPage"] ?? Request.Headers["Referer"].ToString());
        }

		public async Task<IActionResult> Edit() => View(await _userService.FindByUrlUserAsync(User.Identity.Name));

		[HttpPost]
        public async Task SaveTheme([FromBody] JsonDocument data)
		{
			string url = data.RootElement.GetProperty("Url").ToString();
			string theme = data.RootElement.GetProperty("Theme").ToString();
            await _userService.SaveTheme(url, theme);
		}
	}
}
