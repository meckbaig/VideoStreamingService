using System.Security.Claims;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.Services
{
    public interface IUserService
    {
        string NameByUrl(string url);
		Task<User> GetByEmailAsync(string email);
        Task<User> FindByUrlChannelAsync(string url);
        Task<User> GetByUrlUserAsync(string url);
        Task ChangeSubscription(string chUrl, string userUrl, bool? value = null);
        Task CreateUserAsync(User user, string password);
        bool PasswordMatches(User user, string password);
        Task SaveTheme(string url, string theme);
        Task<string> GetTheme(string url);
        Task SaveScreenWidth(string url, bool wide);
        Task<User> SaveUserAsync(EditUserVM user, string[] props);
        Task<string> ChangeThumbnail(string url, IFormFile file);
    }
}
