using System.Security.Claims;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.Services
{
    public interface IUserService
    {
        string NameByPrincipal(ClaimsPrincipal principal);
		Task<User> FindByEmailAsync(string email);
        Task<User> FindByUrlChannelAsync(string url);
        Task<User> FindByUrlUserAsync(string url);
        Task ChangeSubscription(string chUrl, string userUrl, bool? value = null);
        Task CreateUser(User user, string password);
        bool PasswordMatches(User user, string password);
        Task SaveTheme(string url, string theme);
        Task<string> GetTheme(string url);
        Task SaveScreenWidth(string url, bool wide);
	}
}
