using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.Google;
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
        
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties { RedirectUri = Url.Action("GoogleResponse") };

            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        public async Task<IActionResult> GoogleResponse()
        {
            var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            if (!result.Succeeded)
                return _session.Get("LastPage", out string page) ? Redirect(page) : Redirect("/");
            var claimsIdentities = result.Principal.Identities.FirstOrDefault()
                .Claims.Select(claim => new
                {
                    claim.Issuer,
                    claim.OriginalIssuer,
                    claim.Type,
                    claim.Value
                });
            Dictionary<string, string> claimsDictionary = new Dictionary<string, string>();
            foreach (var claim in claimsIdentities)
            {
                claimsDictionary.Add(Path.GetFileName(claim.Type), claim.Value);
            }
            
            User user = await _userService.GetUserByEmailAsync(claimsDictionary["emailaddress"]);
            // if (user != null)
            // {
            //     if (!_userService.PasswordMatches(user, claimsDictionary["nameidentifier"]))
            //     {
            //         TempData["Error"] = "Электронная почта уже используется";
            //         return RedirectToAction("Logout");
            //         return _session.Get("LastPage", out string page) ? Redirect(page) : Redirect("/");
            //     }
            // }
            if (user == null)
            {
                user = new User
                {
                    Email = claimsDictionary["emailaddress"],
                    Name = claimsDictionary["name"],
                    EmailConfirmed = true
                };
                await _userService.CreateUserAsync(user, claimsDictionary["nameidentifier"]);
                user = await _userService.GetUserByEmailAsync(claimsDictionary["emailaddress"]);
            }
            
            await HttpContext.SignOutAsync();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Url),
                new Claim(ClaimTypes.Role, user.Role.Name)
            };
            ClaimsIdentity claimsIdentity = new ClaimsIdentity(claims, "Cookies");
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity));
            Response.Cookies.Append("Theme", user.Theme);
            _session.Remove("CurUser");
            return _session.Get("LastPage", out string page1) ? Redirect(page1) : Redirect("/");
        }
        
        [HttpPost]
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
            if (!ModelState.IsValid) 
                return View(logVM);
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
            Response.Cookies.Append("Theme", user.Theme);
            _session.Remove("CurUser");
            return _session.Get("LastPage", out string page) ? Redirect(page) : Redirect("/");
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
                new Claim(ClaimTypes.Name, user.Url),
                new Claim(ClaimTypes.Role, user.Role.Name)
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
        public async Task<IActionResult> SaveUser(EditUserVM editUserVM)
        {
            if (!ModelState.IsValid)
                return View("Edit", editUserVM);
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

        public async Task<IActionResult> DeleteUser(int id, string url)
        {
            if (url==User.Identity.Name)
                if (await _userService.DeleteUser(id))
                {
                    _session.Remove("LastPage");
                    return await Logout();
                }
            
            TempData["Error"] = "Произошла ошибка во время удаления пользователя";
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
